package com.java.Bookshop.repository;

import com.java.Bookshop.Entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    @EntityGraph(attributePaths = {"user"})
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    @EntityGraph(attributePaths = {"user"})
    List<Review> findAllByOrderByCreatedAtDesc();
}