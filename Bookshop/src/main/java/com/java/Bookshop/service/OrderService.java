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
            }
            else {
                throw new NotEnoughProductQuantityException("Not enough stock quantity");
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

        orderRepository.save(order);

        return new OrderResponseDTO(order.getId(), order.getTotalPrice(),
                order.getOrderDate(), order.getStatus(), order.getItems());
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
                            order.getOrderDate(), order.getStatus(), order.getItems()));
                }
        );
        return responseDTOList;
    }

    public List<OrderResponseDTO> getAllOrders() {
        List<OrderResponseDTO> responseDTOList = new ArrayList<>();
        orderRepository.findAll().forEach(
                (Order order) -> {
                    responseDTOList.add(new OrderResponseDTO(order.getId(), order.getTotalPrice(),
                            order.getOrderDate(), order.getStatus(), order.getItems()));
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
                order.getOrderDate(), order.getStatus(), order.getItems());
    }

}
