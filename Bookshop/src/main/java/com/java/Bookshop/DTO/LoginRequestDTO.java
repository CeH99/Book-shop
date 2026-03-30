package com.java.Bookshop.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import jakarta.validation.constraints.Email;

@Data
public class LoginRequestDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Incorrect format of email")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
