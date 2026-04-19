package com.java.Bookshop.controller;

import com.java.Bookshop.DTO.OrderRequestDTO;
import com.java.Bookshop.DTO.OrderResponseDTO;
import com.java.Bookshop.Entity.Status;
import com.java.Bookshop.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    public List<OrderResponseDTO> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponseDTO createOrder(@Valid @RequestBody OrderRequestDTO dto, Principal principal) {
        return orderService.createOrder(dto, principal.getName());
    }

    @GetMapping("/user/{userId}")
    public List<OrderResponseDTO> getUserOrders(@PathVariable Long userId) {
        return orderService.getUserOrders(userId);
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public OrderResponseDTO updateOrderStatus(@PathVariable Long orderId,
                                              @Valid @RequestParam Status newStatus) {
        return orderService.updateOrderStatus(orderId, newStatus);
    }

    @GetMapping("/my")
    public List<OrderResponseDTO> getMyOrders(Principal principal) {
        return orderService.getMyOrders(principal.getName());
    }

    @GetMapping("/pay")
    public String payOrder(@RequestParam String token) {
        try {
            orderService.processPayment(token);
            return "<html><body style='font-family: Arial, sans-serif; text-align: center; padding-top: 50px;'>" +
                    "<h2 style='color: #27ae60;'>Оплата пройшла успішно! 🎉</h2>" +
                    "<p>Ваше замовлення оплачено і готується до відправки.</p>" +
                    "<a href='http://127.0.0.1:5500/index.html' style='display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;'>Повернутися в магазин</a>" +
                    "</body></html>";
        } catch (Exception e) {
            return "<html><body style='font-family: Arial, sans-serif; text-align: center; padding-top: 50px;'>" +
                    "<h2 style='color: #e74c3c;'>Помилка оплати ❌</h2>" +
                    "<p>" + e.getMessage() + "</p>" +
                    "</body></html>";
        }
    }

    @PatchMapping("/{orderId}/cancel")
    public OrderResponseDTO cancelOrder(@PathVariable Long orderId, Principal principal) {
        return orderService.cancelOrder(orderId, principal.getName());
    }
}
