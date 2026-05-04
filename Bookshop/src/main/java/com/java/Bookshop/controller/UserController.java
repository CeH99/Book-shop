package com.java.Bookshop.controller;

import com.java.Bookshop.DTO.UserUpdateDTO;
import com.java.Bookshop.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public Map<String, String> getCurrentUser(Principal principal) {
        return userService.getCurrentUser(principal.getName());
    }

    @PutMapping("/me")
    public Map<String, String> updateCurrentUser(Principal principal, @Valid @RequestBody UserUpdateDTO dto) {
        return userService.updateCurrentUser(principal.getName(), dto);
    }

    @GetMapping("/check-admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> checkAdminAccess() {
        return ResponseEntity.ok().build();
    }
}