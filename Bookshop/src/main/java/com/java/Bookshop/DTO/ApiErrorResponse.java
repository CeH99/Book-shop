package com.java.Bookshop.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ApiErrorResponse {
    private String message;

    private int status;

    private LocalDateTime timestamp;
}
