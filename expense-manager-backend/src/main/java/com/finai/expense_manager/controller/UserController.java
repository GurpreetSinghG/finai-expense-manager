package com.finai.expense_manager.controller;

import com.finai.expense_manager.dto.LoginRequest;
import com.finai.expense_manager.dto.LoginResponse;
import com.finai.expense_manager.dto.UserRequest;
import com.finai.expense_manager.dto.UserResponse;
import com.finai.expense_manager.model.User;
import com.finai.expense_manager.service.PasswordService;
import com.finai.expense_manager.service.UserService;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final PasswordService passwordService;

    public UserController(UserService userService, PasswordService passwordService) {
        this.userService = userService;
        this.passwordService = passwordService;
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(
            @AuthenticationPrincipal Jwt jwt){
        return userService.getUserByUsername(jwt.getSubject());
    }

    @PostMapping
    public UserResponse createUser(@Valid @RequestBody UserRequest userRequest) {
        return userService.createUser(userRequest);
    }

    @GetMapping("/id/{id}")
    public UserResponse getUser(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return userService.getUserById(id, jwt.getSubject());
    }


    @PutMapping("/update/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                           @RequestBody UserRequest userRequest,
                                   @AuthenticationPrincipal Jwt jwt) {
        return userService.updateUserById(id, jwt.getSubject(), userRequest);
    }

    @DeleteMapping("/id/{id}")
    public String deleteUserById(@PathVariable Long id,
                                 @AuthenticationPrincipal Jwt jwt) {
        userService.deleteUserById(id, jwt.getSubject());
        return "Success";
    }


    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest loginRequest) {
        return userService.authenticate(loginRequest);
    }
}