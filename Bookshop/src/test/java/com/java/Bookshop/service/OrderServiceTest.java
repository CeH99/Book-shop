package com.java.Bookshop.service;

import com.java.Bookshop.DTO.OrderItemRequestDTO;
import com.java.Bookshop.DTO.OrderRequestDTO;
import com.java.Bookshop.DTO.OrderResponseDTO;
import com.java.Bookshop.Entity.*;
import com.java.Bookshop.exception.NotEnoughProductQuantityException;
import com.java.Bookshop.repository.OrderRepository;
import com.java.Bookshop.repository.ProductRepository;
import com.java.Bookshop.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void createOrder_ShouldReturnOrderResponseDTO() {
        // Arrange
        String userEmail = "john.doe@example.com";
        Long productId = 2L;
        int quantity = 2;
        BigDecimal productPrice = BigDecimal.valueOf(100.00);
        String deliveryAddress = "м. Київ, Відділення №1";

        List<OrderItemRequestDTO> orderItemRequests = new ArrayList<>();
        orderItemRequests.add(new OrderItemRequestDTO(productId, quantity));

        OrderRequestDTO orderRequestDTO = new OrderRequestDTO();
        orderRequestDTO.setItems(orderItemRequests);
        orderRequestDTO.setDeliveryAddress(deliveryAddress);

        User user = User.builder()
                .id(1L)
                .name("John")
                .surname("Doe")
                .email(userEmail)
                .password("password")
                .role(Role.ROLE_USER)
                .build();

        Product product = Product.builder()
                .id(productId)
                .title("Test Product")
                .description("Description")
                .price(productPrice)
                .stockQuantity(10)
                .build();

        OrderItem orderItem = OrderItem.builder()
                .product(product)
                .quantity(quantity)
                .price(productPrice)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        orderItems.add(orderItem);

        BigDecimal totalAmount = productPrice.multiply(BigDecimal.valueOf(quantity));

        Order savedOrder = Order.builder()
                .id(1L)
                .user(user)
                .status(Status.PENDING)
                .items(orderItems)
                .totalPrice(totalAmount)
                .deliveryAddress(deliveryAddress)
                .build();

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        // Act
        OrderResponseDTO result = orderService.createOrder(orderRequestDTO, userEmail);

        // Assert
        assertNotNull(result);
        assertEquals(totalAmount, result.getTotalPrice());
        assertEquals(deliveryAddress, result.getDeliveryAddress());

        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_ShouldThrowException_WhenNotEnoughStock() {
        // Arrange
        String userEmail = "john.doe@example.com";
        Long productId = 2L;
        int requestedQuantity = 100;
        int availableStock = 5;
        String deliveryAddress = "м. Київ, Відділення №1";

        List<OrderItemRequestDTO> orderItemRequests = new ArrayList<>();
        orderItemRequests.add(new OrderItemRequestDTO(productId, requestedQuantity));

        OrderRequestDTO orderRequestDTO = new OrderRequestDTO();
        orderRequestDTO.setItems(orderItemRequests);
        orderRequestDTO.setDeliveryAddress(deliveryAddress);

        User user = User.builder().id(1L).email(userEmail).build();

        Product product = Product.builder()
                .id(productId)
                .title("Test book")
                .price(BigDecimal.valueOf(100.00))
                .stockQuantity(availableStock)
                .build();

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        // Act & Assert
        assertThrows(NotEnoughProductQuantityException.class, () -> {
            orderService.createOrder(orderRequestDTO, userEmail);
        });

        verify(orderRepository, never()).save(any(Order.class));
    }
}