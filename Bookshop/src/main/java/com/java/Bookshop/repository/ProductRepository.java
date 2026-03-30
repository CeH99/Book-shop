package com.java.Bookshop.repository;

import com.java.Bookshop.Entity.Product;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByTitle(@NotBlank(message = "title cannot be empty") String title);
}
