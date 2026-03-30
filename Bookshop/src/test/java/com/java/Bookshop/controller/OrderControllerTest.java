package com.java.Bookshop.controller;

import com.java.Bookshop.security.JwtService;
import com.java.Bookshop.security.SecurityConfig;
import com.java.Bookshop.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrderController.class)
@ActiveProfiles("test")
@Import(SecurityConfig.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    void updateOrderStatus_ShouldReturn403ForNormalUser() throws Exception {
        mockMvc.perform(patch("/api/orders/1/status")
                        .param("newStatus", "SHIPPED")
                        .with(csrf()))
                .andExpect(status().isForbidden()); // waiting for 403
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateOrderStatus_ShouldReturn200ForAdmin() throws Exception {
        mockMvc.perform(patch("/api/orders/1/status")
                        .param("newStatus", "SHIPPED")
                        .with(csrf()))
                .andExpect(status().isOk()); // waiting for 200
    }
}