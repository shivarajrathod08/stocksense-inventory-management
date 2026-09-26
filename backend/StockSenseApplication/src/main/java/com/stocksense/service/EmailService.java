package com.stocksense.service;

public interface EmailService {
    void sendPasswordResetOtp(String toEmail, String otp);
}
