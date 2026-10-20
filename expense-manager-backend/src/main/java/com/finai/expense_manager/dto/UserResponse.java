package com.finai.expense_manager.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String fullName;
    private String username;
    private String email;
}
