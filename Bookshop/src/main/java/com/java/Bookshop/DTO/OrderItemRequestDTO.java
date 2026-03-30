package com.java.Bookshop.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemRequestDTO {

    @NotNull(message = "ID of product is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity cant be less then zero")
    private Integer quantity;
}
