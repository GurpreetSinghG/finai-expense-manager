package com.finai.expense_manager.service;

import com.finai.expense_manager.dto.LoginRequest;
import com.finai.expense_manager.dto.LoginResponse;
import com.finai.expense_manager.dto.UserRequest;
import com.finai.expense_manager.dto.UserResponse;
import com.finai.expense_manager.model.User;
import com.finai.expense_manager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordService passwordService;

    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordService passwordService, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail());
    }



    public UserResponse createUser(UserRequest userRequest) {

        if (userRepository.existsByUsername(userRequest.getUsername().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(userRequest.getEmail().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        User user = new User();



        user.setFullName(userRequest.getFullName());
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());

        String hash = passwordService.hashPassword(
                userRequest.getPassword()
        );

        user.setPasswordHash(hash);

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    public UserResponse getUserById(Long id, String authenticatedUsername) {
        User currentUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Authenticated User Not Found"
                        ) );

        if(!currentUser.getId().equals(id)){
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can Only Access Your Account"
            );
        }

        return toResponse(currentUser);
    }



    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserByUsername(String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(()->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User Not Found"
                        ));
        return toResponse(user);
    }

    public UserResponse updateUserById(Long id,String authenticatedUsername ,UserRequest userRequest) {

        User existingUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                                "Authenticated user not found"
                        ));

        if(!existingUser.getId().equals(id)){
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "you can only update your own account"
            );
        }

        existingUser.setFullName(userRequest.getFullName());
        existingUser.setUsername(userRequest.getUsername());
        existingUser.setEmail(userRequest.getEmail());
        existingUser.setPasswordHash(passwordService.hashPassword(userRequest.getPassword()));

        User updatedUser = userRepository.save(existingUser);

        return toResponse(updatedUser);
    }

    public void deleteUserById(Long id, String authenticatedUsername) {
        User currentUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(()->
                        new ResponseStatusException(HttpStatus.FORBIDDEN,
                                "Authenticated User not Found"
                        ));

        if (!currentUser.getId().equals(id)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only delete your account"
            );
        }

        userRepository.delete(currentUser);
    }




    public String testPassword(String password){
        return passwordService.hashPassword(password);
    }

    public LoginResponse authenticate(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(()->
                        new ResponseStatusException(
                                HttpStatusCode.valueOf(401),
                                "Invalid username or password"
                        ));


        boolean passwordMatches = passwordService.matchPassword(
                loginRequest.getPassword(),
                user.getPasswordHash()
        );

        if(!passwordMatches) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Username or Password"
            );
        }

        String token = jwtService.generateToken(user.getUsername());
        UserResponse userResponse = toResponse(user);
        return new LoginResponse(token, "Bearer", userResponse);
    }
}