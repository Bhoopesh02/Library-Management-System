package com.library.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromEmail;

    public void sendOtpEmail(String to, String otpCode) {
        String subject = "Your Registration Verification Code";
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;\">"
                + "<h2 style=\"color: #00B4A8; text-align: center;\">Library Management System</h2>"
                + "<p>Hello,</p>"
                + "<p>Thank you for registering. Please use the following 6-digit verification code to complete your registration:</p>"
                + "<div style=\"background-color: #f4f7f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;\">"
                + otpCode
                + "</div>"
                + "<p>This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>"
                + "<hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\" />"
                + "<p style=\"font-size: 12px; color: #777; text-align: center;\">&copy; 2026 Library Management System. All rights reserved.</p>"
                + "</div>";

        // Always log the OTP to the console for development testing fallback
        logger.info("\n=======================================================\n"
                + " [OTP SERVICE] Registration OTP for {}: {}\n"
                + "=======================================================", to, otpCode);

        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured (missing SMTP credentials). OTP is only available in logs.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            if (fromEmail != null && !fromEmail.isEmpty()) {
                helper.setFrom(fromEmail, "Library Management System");
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("OTP email successfully sent to {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            // We don't throw an exception here so that local dev still works via the console log
        } catch (Exception e) {
            logger.error("An unexpected error occurred while sending email to {}: {}", to, e.getMessage());
        }
    }

    public void sendResetPasswordEmail(String to, String otpCode) {
        String subject = "Password Reset Request";
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;\">"
                + "<h2 style=\"color: #00B4A8; text-align: center;\">Library Management System</h2>"
                + "<p>Hello,</p>"
                + "<p>We received a request to reset your password. Please use the following 6-digit verification code to reset it:</p>"
                + "<div style=\"background-color: #f4f7f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;\">"
                + otpCode
                + "</div>"
                + "<p>This code will expire in 5 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>"
                + "<hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\" />"
                + "<p style=\"font-size: 12px; color: #777; text-align: center;\">&copy; 2026 Library Management System. All rights reserved.</p>"
                + "</div>";

        logger.info("\n=======================================================\n"
                + " [OTP SERVICE] Password Reset OTP for {}: {}\n"
                + "=======================================================", to, otpCode);

        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. OTP is only available in logs.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            if (fromEmail != null && !fromEmail.isEmpty()) {
                helper.setFrom(fromEmail, "Library Management System");
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Password reset OTP email successfully sent to {}", to);
        } catch (Exception e) {
            logger.error("An unexpected error occurred while sending email to {}: {}", to, e.getMessage());
        }
    }
}
