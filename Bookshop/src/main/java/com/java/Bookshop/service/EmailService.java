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

    public void sendPaymentLinkEmail(String recipientEmail, String userName, Long orderId, String paymentLink) {
        String subject = "Оплата замовлення #" + orderId + " | Книгарня Bookshop";

        String htmlBody = "<h1>Привіт, " + userName + "!</h1>"
                + "<p>Дякуємо за твоє замовлення <b>#" + orderId + "</b>.</p>"
                + "<p>Щоб ми могли розпочати його збирання та відправку, будь ласка, здійсни оплату за цим посиланням:</p>"
                + "<p><a href='" + paymentLink + "' style='display:inline-block; padding:12px 24px; background-color:#c91818; color:#ffffff; text-decoration:none; border-radius:5px; font-weight:bold;'>Оплатити замовлення</a></p>"
                + "<p><i>Якщо кнопка не працює, скопіюй це посилання у свій браузер: <br><a href='" + paymentLink + "'>" + paymentLink + "</a></i></p>"
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
            System.out.println("Payment email sent successfully to " + recipientEmail + " for order " + orderId);

        } catch (SesException e) {
            System.err.println("Помилка відправки листа AWS SES (Payment): " + e.awsErrorDetails().errorMessage());
        }
    }
}
