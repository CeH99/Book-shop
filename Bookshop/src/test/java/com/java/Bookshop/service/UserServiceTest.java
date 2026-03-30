package com.java.Bookshop.service;

import com.java.Bookshop.DTO.UserRegistrationDTO;
import com.java.Bookshop.Entity.Role;
import com.java.Bookshop.Entity.User;
import com.java.Bookshop.exception.UserAlreadyExistsException;
import com.java.Bookshop.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;


    @Test
    void createUser_ShouldReturnSavedUser_WhenDataIsValid() {
        UserRegistrationDTO dto = new UserRegistrationDTO();
        dto.setName("Ivan");
        dto.setSurname("Ivanov");
        dto.setEmail("ivan@example.com");
        dto.setTelephone("123456789");
        dto.setPassword("secretPassword");

        User savedUser = User.builder()
                .id(1L)
                .name("Ivan")
                .surname("Ivanov")
                .email("ivan@example.com")
                .telephone("123456789")
                .password("encoded_secretPassword")
                .role(Role.ROLE_USER)
                .build();

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);

        when(passwordEncoder.encode(dto.getPassword())).thenReturn("encoded_secretPassword");

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // ---------------------------------------------------------------
        User result = userService.createUser(dto);

        assertNotNull(result);
        assertEquals("ivan@example.com", result.getEmail());
        assertEquals("encoded_secretPassword", result.getPassword());
        assertEquals(Role.ROLE_USER, result.getRole());

        verify(passwordEncoder).encode("secretPassword");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_ShouldThrowException_WhenEmailAlreadyExists() {
        UserRegistrationDTO dto = new UserRegistrationDTO();
        dto.setEmail("taken@example.com");
        dto.setPassword("12345");

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        // --------------------------------------------------------------------------------
        assertThrows(UserAlreadyExistsException.class, () -> {
            userService.createUser(dto);
        });

        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
}