package com.java.Bookshop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final SesClient sesClient;

    @Value("${aws.ses.sender-email}")
    private String senderEmail;

    public void sendWelcomeEmail(String recipientEmail, String userName) {
        String subject = "Вітаємо у нашій Книгарні! 🎉";

        String htmlBody = "<h1>Привіт, " + userName + "!</h1>"
                + "<p>Дякуємо за реєстрацію у нашому книжковому інтернет-магазині.</p>"
                + "<p>Ми раді бачити тебе серед наших читачів. Бажаємо знайти багато цікавих книг!</p>"
                + "<br><p><i>З повагою, команда Bookshop.</i></p>";

        try {
            SendEmailRequest request = SendEmailRequest.builder()
                    .source(senderEmail)
                    .destination(Destination.builder().toAddresses(recipientEmail).build())
                    .message(Message.builder()
                            .subject(Content.builder().data(subject).build())
                            .body(Body.builder()
                                    .html(Content.builder().data(htmlBody).build())
                                    .build())
                            .build())
                    .build();

            sesClient.sendEmail(request);
            System.out.println("Welcome email sent successfully to " + recipientEmail);

        } catch (SesException e) {
            System.err.println("Помилка відправки листа AWS SES: " + e.awsErrorDetails().errorMessage());
        }
    }
}
