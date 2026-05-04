package com.java.Bookshop.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private String text;
    private Integer rating;
    private LocalDateTime createdAt;
    private String userName;
}