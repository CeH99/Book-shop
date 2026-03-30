package com.java.Bookshop.controller;

import com.java.Bookshop.DTO.LoginRequestDTO;
import com.java.Bookshop.DTO.TokenResponseDTO;
import com.java.Bookshop.DTO.UserRegistrationDTO;
import com.java.Bookshop.DTO.UserResponseDTO;
import com.java.Bookshop.Entity.User;
import com.java.Bookshop.repository.UserRepository;
import com.java.Bookshop.security.JwtService;
import com.java.Bookshop.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO register(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        User savedUser = userService.createUser(registrationDTO);

        UserResponseDTO responseDTO = new UserResponseDTO();

        responseDTO.setId(savedUser.getId());
        responseDTO.setName(savedUser.getName());
        responseDTO.setSurname(savedUser.getSurname());
        responseDTO.setEmail(savedUser.getEmail());

        return responseDTO;
    }

    @PostMapping("/login")
    public TokenResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(),
                        request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(
                        () -> new UsernameNotFoundException("User with this email was not found")
                );

        String jwtToken = jwtService.generateToken(user);

        return new TokenResponseDTO(jwtToken);
    }
}
