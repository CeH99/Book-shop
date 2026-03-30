package com.java.Bookshop.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequestDTO {
    @NotBlank(message = "title cant be empty")
    private String title;

    private String description;

    @PositiveOrZero(message = "Price cant be less then zero")
    @NotNull(message = "Price is required")
    private BigDecimal price;

    @NotNull(message = "Stock Quantity is required")
    @PositiveOrZero(message = "Quantity cant be less then zero")
    private Integer stockQuantity;

    private String imageKey;

}