package com.java.Bookshop.DTO;

import lombok.Data;

@Data
public class UserUpdateDTO {
    private String name;
    private String surname;
    private String email;
    private String telephone;
}