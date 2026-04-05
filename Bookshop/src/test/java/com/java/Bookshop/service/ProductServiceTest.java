package com.java.Bookshop.service;

import com.java.Bookshop.DTO.ProductRequestDTO;
import com.java.Bookshop.DTO.ProductResponseDTO;
import com.java.Bookshop.Entity.Category;
import com.java.Bookshop.Entity.Product;
import com.java.Bookshop.exception.ProductAlreadyExistsException;
import com.java.Bookshop.exception.ProductNotFoundException;
import com.java.Bookshop.repository.CategoryRepository;
import com.java.Bookshop.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void createProduct_ShouldReturnProductResponseDTO() {
        // Arrange
        ProductRequestDTO requestDTO = new ProductRequestDTO();
        requestDTO.setTitle("Harry Potter");
        requestDTO.setPrice(BigDecimal.valueOf(500));
        requestDTO.setStockQuantity(10);
        requestDTO.setCategoryId(1L);
        requestDTO.setAuthor("J.K. Rowling");

        Category category = new Category();
        category.setId(1L);
        category.setName("Фантастика");

        Product savedProduct = new Product();
        savedProduct.setId(1L);
        savedProduct.setTitle("Harry Potter");
        savedProduct.setPrice(BigDecimal.valueOf(500));
        savedProduct.setStockQuantity(10);
        savedProduct.setCategory(category);
        savedProduct.setAuthor("J.K. Rowling"); // ДОДАЛИ АВТОРА В ЗБЕРЕЖЕНУ СУТНІСТЬ

        when(productRepository.existsByTitle(requestDTO.getTitle())).thenReturn(false);
        when(categoryRepository.findById(requestDTO.getCategoryId())).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // Act
        ProductResponseDTO result = productService.createProduct(requestDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Harry Potter", result.getTitle());
        assertEquals("Фантастика", result.getCategoryName());
        assertEquals("J.K. Rowling", result.getAuthor()); // ПЕРЕВІРЯЄМО, ЧИ АВТОР ПОВЕРНУВСЯ

        verify(categoryRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_ShouldThrowException_WhenProductAlreadyExists() {
        ProductRequestDTO requestDTO = new ProductRequestDTO();
        requestDTO.setTitle("Harry Potter");
        requestDTO.setPrice(BigDecimal.valueOf(500));
        requestDTO.setStockQuantity(10);
        requestDTO.setAuthor("J.K. Rowling");

        when(productRepository.existsByTitle(requestDTO.getTitle())).thenReturn(true);

        assertThrows(ProductAlreadyExistsException.class, () -> {
            productService.createProduct(requestDTO);
        });

        verify(categoryRepository, never()).findById(any());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void createProduct_ShouldThrowException_WhenCategoryNotFound() {
        ProductRequestDTO requestDTO = new ProductRequestDTO();
        requestDTO.setTitle("Harry Potter 2");
        requestDTO.setCategoryId(99L);
        requestDTO.setAuthor("J.K. Rowling");

        when(productRepository.existsByTitle(requestDTO.getTitle())).thenReturn(false);
        when(categoryRepository.findById(requestDTO.getCategoryId())).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.createProduct(requestDTO);
        });

        assertEquals("Category not found", exception.getMessage());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void updateProduct_ShouldThrowException_WhenProductNotFound() {
        Long nonExistentProductId = 999L;
        ProductRequestDTO requestDTO = new ProductRequestDTO();
        requestDTO.setTitle("Новое название");
        requestDTO.setAuthor("Новий Автор");

        when(productRepository.findById(nonExistentProductId)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () -> {
            productService.updateProduct(nonExistentProductId, requestDTO);
        });

        verify(categoryRepository, never()).findById(any());
        verify(productRepository, never()).save(any(Product.class));
    }
}