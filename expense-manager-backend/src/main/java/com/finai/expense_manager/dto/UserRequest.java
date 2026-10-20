package com.finai.expense_manager.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @NotBlank(message = "Username is Required")
    private String username;

    @NotBlank(message = "password is required")
    @Size(min = 8, message = "Password must contain 8 digit")
    private String password;

    @NotBlank(message = "email required")
    @Email(message = "Enter a valid email")
    private String email;
    private String passwordHash;


}
