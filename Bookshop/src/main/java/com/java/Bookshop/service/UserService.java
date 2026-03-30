package com.java.Bookshop.service;

import com.java.Bookshop.DTO.UserRegistrationDTO;
import com.java.Bookshop.Entity.Role;
import com.java.Bookshop.Entity.User;
import com.java.Bookshop.exception.UserAlreadyExistsException;
import com.java.Bookshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(UserRegistrationDTO dto) {

        if(userRepository.existsByEmail(dto.getEmail())) {
            throw new UserAlreadyExistsException("User is already in database");
        }

        User newUser = User.builder()
                .name(dto.getName())
                .surname(dto.getSurname())
                .email(dto.getEmail())
                .telephone(dto.getTelephone())
                .build();

        //!!! Needs to be hashed with spring security
        newUser.setPassword(passwordEncoder.encode(dto.getPassword()));

        newUser.setRole(Role.ROLE_USER);

        return userRepository.save(newUser);
    }
}
