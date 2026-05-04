package com.java.Bookshop.repository;

import com.java.Bookshop.Entity.Product;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByTitle(@NotBlank(message = "title cannot be empty") String title);
    Page<Product> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByAuthor(String author, Pageable pageable);

    @Query("SELECT DISTINCT p.author FROM Product p WHERE p.author IS NOT NULL ORDER BY p.author ASC")
    List<String> findAllDistinctAuthors();

    Optional<Product> findByIsBannerTrue();

    @Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:author IS NULL OR :author = '' OR p.author = :author) AND " +
            "(:search IS NULL OR :search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:filterByIds = false OR p.id IN :ids)")
    Page<Product> findWithFilters(@Param("categoryId") Long categoryId,
                                  @Param("author") String author,
                                  @Param("search") String search,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  @Param("filterByIds") boolean filterByIds,
                                  @Param("ids") List<Long> ids,
                                  Pageable pageable);
}
