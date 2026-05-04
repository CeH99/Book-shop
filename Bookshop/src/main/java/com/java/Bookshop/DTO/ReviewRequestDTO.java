package com.java.Bookshop.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequestDTO {
    @NotNull
    private Long productId;

    @NotBlank
    private String text;

    @Min(1) @Max(5)
    private Integer rating;
}