package com.java.Bookshop.DTO;

import jakarta.validation.Valid; // ДОБАВИТЬ
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequestDTO {

    @NotEmpty(message = "cart cant be empty")
    @Valid
    private List<OrderItemRequestDTO> items;
}