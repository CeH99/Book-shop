package com.java.Bookshop.controller;

import com.java.Bookshop.DTO.ProductResponseDTO;
import com.java.Bookshop.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Set;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<Set<ProductResponseDTO>> getWishlist(Principal principal) {
        Set<ProductResponseDTO> wishlist = wishlistService.getWishlist(principal.getName());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addToWishlist(@PathVariable Long productId, Principal principal) {
        wishlistService.addToWishlist(productId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId, Principal principal) {
        wishlistService.removeFromWishlist(productId, principal.getName());
        return ResponseEntity.ok().build();
    }
}