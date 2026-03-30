package com.java.Bookshop.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationDTO {
    @NotBlank(message = "Name cant be empty")
    private String name;

    @NotBlank(message = "Surname cant be empty")
    private String surname;

    @NotBlank(message = "Email is required")
    @Email(message = "Incorrect format of email")
    private String email;

    @Size(max = 20, message = "Telephone is to long")
    private String telephone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must include more than 7 symbols")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).*$", message = "Password must include at least one digit and letter")
    private String password;
}
