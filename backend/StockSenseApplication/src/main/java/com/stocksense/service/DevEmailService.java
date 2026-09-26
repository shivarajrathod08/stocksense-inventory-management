package com.stocksense.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DevEmailService implements EmailService {

    @Override
    public void sendPasswordResetOtp(String toEmail, String otp) {
        log.info("""
            
            ================================================================================
            [EMAIL SERVICE - DEV DISPATCH]
            To: {}
            Subject: StockSense Security: Your 6-Digit Password Reset OTP
            
            Hello,
            
            A password reset was requested for your StockSense account.
            Your single-use 6-digit verification code is:
            
                >>>  {}  <<<
            
            This code will expire in 5 minutes. If you did not request this, please ignore.
            ================================================================================
            """, toEmail, otp);
    }
}
