package com.java.Bookshop.repository;

import com.java.Bookshop.Entity.Product;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByTitle(@NotBlank(message = "title cannot be empty") String title);
    Page<Product> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByAuthor(String author, Pageable pageable);

    @Query("SELECT DISTINCT p.author FROM Product p WHERE p.author IS NOT NULL ORDER BY p.author ASC")
    List<String> findAllDistinctAuthors();
}
