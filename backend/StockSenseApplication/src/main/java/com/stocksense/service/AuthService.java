package com.stocksense.service;

import com.stocksense.dto.request.LoginRequest;
import com.stocksense.dto.request.RegisterRequest;
import com.stocksense.dto.response.AuthResponse;
import com.stocksense.entity.Role;
import com.stocksense.entity.User;
import com.stocksense.exception.BusinessException;
import com.stocksense.exception.DuplicateResourceException;
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
}
