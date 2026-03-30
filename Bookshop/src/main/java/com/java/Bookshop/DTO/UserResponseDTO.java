package com.java.Bookshop.DTO;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String name;
    private String surname;
    private String email;
}