package com.java.Bookshop.service;

import com.java.Bookshop.DTO.OrderStatusMessage;
import com.java.Bookshop.Entity.Order;
import com.java.Bookshop.Entity.Status;
import com.java.Bookshop.repository.OrderRepository;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SqsOrderListener {

    private final OrderRepository orderRepository;
    private final SqsService sqsService;

    @SqsListener("${aws.sqs.queue-url}")
    @Transactional
    public void handleOrderStatusUpdate(OrderStatusMessage message) {
        Order order = orderRepository.findById(message.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order wasnt found"));

        System.out.println("Received a message change status of order#" + order.getId() + " to " + message.getTargetStatus());

        order.setStatus(message.getTargetStatus());
        orderRepository.save(order);

        if (message.getTargetStatus() == Status.SHIPPED) {
            sqsService.sendOrderStatusUpdate(order.getId(), Status.DELIVERED, 120);
        }
    }
}