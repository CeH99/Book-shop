package com.java.Bookshop.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateDTO {
    @NotBlank(message = "Name cant be empty")
    private String name;

    @NotBlank(message = "Surname cant be empty")
    private String surname;

    @NotBlank(message = "Email is required")
    @Email(message = "Incorrect format of email")
    private String email;

    @Size(max = 20, message = "Telephone is too long")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Incorrect telephone format")
    private String telephone;
}