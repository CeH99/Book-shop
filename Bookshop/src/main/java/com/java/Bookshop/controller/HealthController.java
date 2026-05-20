package com.java.Bookshop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bookshoph")
public class HealthController {

    @GetMapping("/health")
    public String healthCheck() {
        return ResponseEntity.ok().build().toString();
    }

}
