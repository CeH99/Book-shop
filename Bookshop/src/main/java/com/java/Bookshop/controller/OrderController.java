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
}
