package com.java.Bookshop.service;

import com.java.Bookshop.DTO.ReviewRequestDTO;
import com.java.Bookshop.DTO.ReviewResponseDTO;
import com.java.Bookshop.Entity.Product;
import com.java.Bookshop.Entity.Review;
import com.java.Bookshop.Entity.User;
import com.java.Bookshop.exception.ProductNotFoundException;
import com.java.Bookshop.exception.ReviewNotFoundException;
import com.java.Bookshop.exception.UserNotFoundException;
import com.java.Bookshop.repository.ProductRepository;
import com.java.Bookshop.repository.ReviewRepository;
import com.java.Bookshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewResponseDTO addReview(ReviewRequestDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User with email " + userEmail + " not found"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ProductNotFoundException("Product with ID " + dto.getProductId() + " not found"));

        Review review = Review.builder()
                .text(dto.getText())
                .rating(dto.getRating())
                .product(product)
                .user(user)
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToDTO(savedReview);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Review with ID " + reviewId + " not found"));
        reviewRepository.delete(review);
    }

    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ReviewResponseDTO mapToDTO(Review review) {
        String name = "Анонім";
        if (review.getUser() != null) {
            name = (review.getUser().getName() != null ? review.getUser().getName() : "")
                    + " "
                    + (review.getUser().getSurname() != null ? review.getUser().getSurname() : "");
        }

        return new ReviewResponseDTO(
                review.getId(),
                review.getText(),
                review.getRating(),
                review.getCreatedAt(),
                name.trim().isEmpty() ? "Користувач" : name.trim()
        );
    }
}