package com.java.Bookshop.service;

import com.java.Bookshop.DTO.OrderStatusMessage;
import com.java.Bookshop.Entity.Status;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class SqsService {

    private final SqsTemplate sqsTemplate;

    @Value("${aws.sqs.queue-url}")
    private String queueUrl;

    public void sendOrderStatusUpdate(Long orderId, Status targetStatus, int delaySeconds) {
        OrderStatusMessage message = new OrderStatusMessage(orderId, targetStatus);

        sqsTemplate.send(to -> to
                .queue(queueUrl)
                .payload(message)
                .delaySeconds(delaySeconds)
        );

        System.out.println("Message in queue for #" + orderId + " (" + targetStatus + ") sent with delay " + delaySeconds + "с");
    }
}