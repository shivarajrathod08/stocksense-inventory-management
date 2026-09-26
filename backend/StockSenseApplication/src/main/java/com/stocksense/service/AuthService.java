package com.stocksense.service;

import com.stocksense.dto.request.ForgotPasswordRequest;
import com.stocksense.dto.request.LoginRequest;
import com.stocksense.dto.request.RegisterRequest;
import com.stocksense.dto.request.ResetPasswordRequest;
import com.stocksense.dto.request.VerifyOtpRequest;
import com.stocksense.dto.response.AuthResponse;
import com.stocksense.dto.response.MessageResponse;
import com.stocksense.entity.PasswordResetOtp;
import com.stocksense.entity.Role;
import com.stocksense.entity.User;
import com.stocksense.exception.BusinessException;
import com.stocksense.exception.DuplicateResourceException;
import com.stocksense.repository.PasswordResetOtpRepository;
import com.stocksense.repository.RoleRepository;
import com.stocksense.repository.UserRepository;
import com.stocksense.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordResetOtpRepository otpRepository;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new DuplicateResourceException("Email already registered: " + req.email());
        }

        Role staffRole = roleRepository.findByName("ROLE_STAFF")
                .orElseThrow(() -> new BusinessException("Default role not found"));

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .roles(Set.of(staffRole))
                .active(true)
                .build();

        userRepository.save(user);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        String token = tokenProvider.generateToken((UserDetails) auth.getPrincipal());
        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        return AuthResponse.of(token, user.getId(), user.getName(), user.getEmail(), roles);
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BusinessException("User not found"));

        String token = tokenProvider.generateToken((UserDetails) auth.getPrincipal());
        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        return AuthResponse.of(token, user.getId(), user.getName(), user.getEmail(), roles);
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest req) {
        String email = req.email().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(email.toLowerCase());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String userEmail = user.getEmail();

            // Invalidate any previously active unused OTPs for this email
            List<PasswordResetOtp> activeOtps = otpRepository.findByEmailAndUsedFalse(userEmail);
            for (PasswordResetOtp o : activeOtps) {
                o.setUsed(true);
            }
            if (!activeOtps.isEmpty()) {
                otpRepository.saveAll(activeOtps);
            }

            // Generate 6-digit secure OTP
            String otp = String.format("%06d", secureRandom.nextInt(1_000_000));

            // Store hashed OTP with 5 minute expiration
            PasswordResetOtp resetOtp = PasswordResetOtp.builder()
                    .email(userEmail)
                    .otpHash(passwordEncoder.encode(otp))
                    .expiryDate(LocalDateTime.now().plusMinutes(5))
                    .verified(false)
                    .used(false)
                    .build();
            otpRepository.save(resetOtp);

            // Send OTP through email service (dev email logger will log it clearly)
            emailService.sendPasswordResetOtp(userEmail, otp);
        }

        // Generic response to prevent user enumeration
        return MessageResponse.of("If the email is registered, a password reset code has been sent.");
    }

    @Transactional
    public MessageResponse verifyOtp(VerifyOtpRequest req) {
        String email = req.email().trim();
        PasswordResetOtp resetOtp = findActiveOtp(email)
                .orElseThrow(() -> new BusinessException("Invalid or expired OTP"));

        if (resetOtp.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("OTP has expired");
        }

        if (resetOtp.isUsed()) {
            throw new BusinessException("OTP has already been used");
        }

        if (!passwordEncoder.matches(req.otp().trim(), resetOtp.getOtpHash())) {
            throw new BusinessException("Invalid OTP");
        }

        resetOtp.setVerified(true);
        otpRepository.save(resetOtp);

        return MessageResponse.of("OTP verified successfully");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest req) {
        String email = req.email().trim();
        PasswordResetOtp resetOtp = findActiveOtp(email)
                .orElseThrow(() -> new BusinessException("No valid OTP found for this email"));

        if (resetOtp.isUsed()) {
            throw new BusinessException("OTP has already been used");
        }

        if (resetOtp.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("OTP has expired");
        }

        if (!resetOtp.isVerified()) {
            throw new BusinessException("OTP has not been verified yet");
        }

        if (!passwordEncoder.matches(req.otp().trim(), resetOtp.getOtpHash())) {
            throw new BusinessException("Invalid OTP");
        }

        User user = userRepository.findByEmail(resetOtp.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));

        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        // Mark current OTP as used
        resetOtp.setUsed(true);
        otpRepository.save(resetOtp);

        // Invalidate any other active OTPs for that email
        List<PasswordResetOtp> remaining = otpRepository.findByEmailAndUsedFalse(resetOtp.getEmail());
        for (PasswordResetOtp o : remaining) {
            o.setUsed(true);
        }
        if (!remaining.isEmpty()) {
            otpRepository.saveAll(remaining);
        }

        return MessageResponse.of("Password has been reset successfully");
    }

    private Optional<PasswordResetOtp> findActiveOtp(String email) {
        Optional<PasswordResetOtp> otp = otpRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);
        if (otp.isEmpty()) {
            otp = otpRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email.toLowerCase());
        }
        return otp;
    }
}
