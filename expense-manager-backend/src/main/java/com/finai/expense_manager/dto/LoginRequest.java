package com.finai.expense_manager.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "username required")
    private String username;

    @NotBlank(message = "password required")
    private String password;


}
