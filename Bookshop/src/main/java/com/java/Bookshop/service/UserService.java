package com.java.Bookshop.service;

import com.java.Bookshop.DTO.UserRegistrationDTO;
import com.java.Bookshop.DTO.UserUpdateDTO;
import com.java.Bookshop.Entity.Role;
import com.java.Bookshop.Entity.User;
import com.java.Bookshop.exception.UserAlreadyExistsException;
import com.java.Bookshop.exception.UserNotFoundException;
import com.java.Bookshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
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

        newUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        newUser.setRole(Role.ROLE_USER);

        return userRepository.save(newUser);
    }

    @Transactional(readOnly = true)
    public Map<String, String> getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));

        Map<String, String> userData = new HashMap<>();
        userData.put("name", user.getName());
        userData.put("surname", user.getSurname());
        userData.put("email", user.getEmail());
        userData.put("telephone", user.getTelephone());

        return userData;
    }

    @Transactional
    public Map<String, String> updateCurrentUser(String email, UserUpdateDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));

        user.setName(dto.getName());
        user.setSurname(dto.getSurname());
        user.setEmail(dto.getEmail());
        user.setTelephone(dto.getTelephone());

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Профіль успішно оновлено!");
        return response;
    }
}