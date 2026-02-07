package com.springpro.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRegistrationEmail(String toEmail, String name, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("sahilmalaiya7@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Welcome to SkillForge - Account Created");

            String emailBody = "Hello " + name + ",\n\n" +
                    "Your account has been successfully created.\n\n" +
                    "You can now access the platform and start using the available features.\n\n" +
                    "Your login credentials are as follows:\n\n" +
                    "----------------------------------------\n" +
                    "Login Email : " + toEmail + "\n" +
                    "Password    : " + password + "\n" +
                    "----------------------------------------\n\n" +
                    // "Please keep your credentials safe.\n\n" +
                    "Please keep these credentials secure and do not share them with anyone.\n\n" +
                    "We wish you the best in your learning journey with SkillForge.\n\n" +

                    "Regards,\n" +
                    "SkillForge Team\n\n" +


                    "----------------------------------------\n" +
                    "This is an automated message. Please do not reply to this email.";

            message.setText(emailBody);

            mailSender.send(message);

            System.out.println("Email sent successfully to: " + toEmail);

        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
        }
    }
}
