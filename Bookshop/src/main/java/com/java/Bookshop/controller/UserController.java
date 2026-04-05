package com.java.Bookshop.controller;

import com.java.Bookshop.DTO.UserUpdateDTO;
import com.java.Bookshop.Entity.User;
import com.java.Bookshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public Map<String, String> getCurrentUser(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, String> userData = new HashMap<>();
        userData.put("name", user.getName());
        userData.put("surname", user.getSurname());
        userData.put("email", user.getEmail());

        return userData;
    }

    @PutMapping("/me")
    public Map<String, String> updateCurrentUser(Principal principal, @RequestBody UserUpdateDTO dto) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(dto.getName());
        user.setSurname(dto.getSurname());

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Профіль успішно оновлено!");
        return response;
    }

    @GetMapping("/check-admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> checkAdminAccess() {
        return ResponseEntity.ok().build();
    }
}