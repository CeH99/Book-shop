package com.java.Bookshop.service;

import com.java.Bookshop.DTO.ProductResponseDTO;
import com.java.Bookshop.Entity.Product;
import com.java.Bookshop.Entity.Review;
import com.java.Bookshop.Entity.User;
import com.java.Bookshop.exception.ProductNotFoundException;
import com.java.Bookshop.exception.UserNotFoundException;
import com.java.Bookshop.repository.ProductRepository;
import com.java.Bookshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Set<ProductResponseDTO> getWishlist(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));

        return user.getWishlist().stream()
                .map(this::mapToProductResponseDTO)
                .collect(Collectors.toSet());
    }

    @Transactional
    public void addToWishlist(Long productId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product with ID " + productId + " not found"));

        user.getWishlist().add(product);
        userRepository.save(user);
    }

    @Transactional
    public void removeFromWishlist(Long productId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product with ID " + productId + " not found"));

        user.getWishlist().remove(product);
        userRepository.save(user);
    }

    private ProductResponseDTO mapToProductResponseDTO(Product product) {
        Double avgRating = 0.0;
        if (product.getReviews() != null && !product.getReviews().isEmpty()) {
            avgRating = product.getReviews().stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            avgRating = Math.round(avgRating * 10.0) / 10.0;
        }

        return new ProductResponseDTO(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageKey(),
                product.getCategory() != null ? product.getCategory().getName() : "Без категорії",
                product.getAuthor(),
                product.getDiscount(),
                avgRating
        );
    }
}