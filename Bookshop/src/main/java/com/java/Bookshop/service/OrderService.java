package com.java.Bookshop.service;

import com.java.Bookshop.DTO.OrderItemRequestDTO;
import com.java.Bookshop.DTO.OrderRequestDTO;
import com.java.Bookshop.DTO.OrderResponseDTO;
import com.java.Bookshop.Entity.*;
import com.java.Bookshop.exception.NotEnoughProductQuantityException;
import com.java.Bookshop.exception.OrderNotFoundException;
import com.java.Bookshop.repository.OrderItemRepository;
import com.java.Bookshop.repository.OrderRepository;
import com.java.Bookshop.repository.ProductRepository;
import com.java.Bookshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final SqsService sqsService;

    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User was not found"));

        Order order = new Order();
        BigDecimal totalPrice = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for(OrderItemRequestDTO itemDTO : dto.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product was not found"));

            if(product.getStockQuantity() >= itemDTO.getQuantity()) {
                product.setStockQuantity(product.getStockQuantity() - itemDTO.getQuantity());
                productRepository.save(product);
            }
            else {
                throw new NotEnoughProductQuantityException("Not enough product quantity of '" + product.getTitle() + "'. Available: " + product.getStockQuantity() + "pcs");
            }

            totalPrice = totalPrice.add(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));

            OrderItem orderItem = OrderItem.builder()
                    .price(product.getPrice())
                    .product(product)
                    .quantity(itemDTO.getQuantity())
                    .order(order)
                    .build();

            items.add(orderItem);
        }

        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Status.PENDING);
        order.setTotalPrice(totalPrice);
        order.setUser(user);
        order.setItems(items);
        order.setDeliveryAddress(dto.getDeliveryAddress());

        String paymentToken = java.util.UUID.randomUUID().toString();
        order.setPaymentToken(paymentToken);

        order = orderRepository.save(order);

        String paymentUrl = "http://localhost:8080/api/orders/pay?token=" + paymentToken;
        emailService.sendPaymentLinkEmail(user.getEmail(), user.getName(), order.getId(), paymentUrl);

        return new OrderResponseDTO(order.getId(), order.getTotalPrice(),
                order.getOrderDate(), order.getStatus(), order.getItems(), order.getDeliveryAddress());
    }

    public List<OrderResponseDTO> getMyOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return getUserOrders(user.getId());
    }

    public List<OrderResponseDTO> getUserOrders(Long userId) {
        List<OrderResponseDTO> responseDTOList = new ArrayList<>();
        orderRepository.findByUserId(userId).forEach(
                (Order order) -> {
                    responseDTOList.add(new OrderResponseDTO(order.getId(), order.getTotalPrice(),
                            order.getOrderDate(), order.getStatus(), order.getItems(), order.getDeliveryAddress()));
                }
        );
        return responseDTOList;
    }

    public List<OrderResponseDTO> getAllOrders() {
        List<OrderResponseDTO> responseDTOList = new ArrayList<>();
        orderRepository.findAll().forEach(
                (Order order) -> {
                    responseDTOList.add(new OrderResponseDTO(order.getId(), order.getTotalPrice(),
                            order.getOrderDate(), order.getStatus(), order.getItems(), order.getDeliveryAddress()));
                }
        );
        return responseDTOList;
    }

    public OrderResponseDTO updateOrderStatus(Long orderId, Status newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order with this id doesnt exist"));
        order.setStatus(newStatus);

        orderRepository.save(order);

        return new OrderResponseDTO(order.getId(), order.getTotalPrice(),
                order.getOrderDate(), order.getStatus(), order.getItems(), order.getDeliveryAddress());
    }

    @Transactional
    public void processPayment(String token) {
        Order order = orderRepository.findByPaymentToken(token)
                .orElseThrow(() -> new RuntimeException("Недійсне посилання на оплату"));

        if (order.getStatus() != Status.PENDING) {
            throw new RuntimeException("Замовлення вже оплачено або скасовано");
        }

        order.setStatus(Status.PAID);
        orderRepository.save(order);

        sqsService.sendOrderStatusUpdate(order.getId(), Status.SHIPPED, 60);
    }

    @Transactional
    public OrderResponseDTO cancelOrder(Long orderId, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order wasnt found"));

        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You cannot cancel this order");
        }

        if (order.getStatus() == Status.SHIPPED || order.getStatus() == Status.DELIVERED || order.getStatus() == Status.CANCELLED) {
            throw new RuntimeException("This order could not be cancelled.");
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Status.CANCELLED);
        orderRepository.save(order);

        return new OrderResponseDTO(order.getId(), order.getTotalPrice(),
                order.getOrderDate(), order.getStatus(), order.getItems(), order.getDeliveryAddress());
    }

}
