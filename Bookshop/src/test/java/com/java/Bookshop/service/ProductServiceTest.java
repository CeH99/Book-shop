package com.java.Bookshop.service;

import com.java.Bookshop.DTO.ProductRequestDTO;
import com.java.Bookshop.DTO.ProductResponseDTO;
import com.java.Bookshop.Entity.Product;
import com.java.Bookshop.exception.ProductAlreadyExistsException;
import com.java.Bookshop.exception.ProductNotFoundException;
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

    @InjectMocks
    private ProductService productService;

    @Test
    void createProduct_ShouldReturnProductResponseDTO() {

        ProductRequestDTO requestDTO = new ProductRequestDTO();
        requestDTO.setTitle("Harry Potter");
        requestDTO.setPrice(BigDecimal.valueOf(500));
        requestDTO.setStockQuantity(10);

        Product savedProduct = new Product();
        savedProduct.setId(1L);
        savedProduct.setTitle("Harry Potter");
        savedProduct.setPrice(BigDecimal.valueOf(500));
        savedProduct.setStockQuantity(10);

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductResponseDTO result = productService.createProduct(requestDTO);

        assertNotNull(result);

        assertEquals(1L, result.getId());
        assertEquals("Harry Potter", result.getTitle());

        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_ShouldThrowException_WhenProductAlreadyExists() {
        ProductRequestDTO requestDTO = new ProductRequestDTO();
        requestDTO.setTitle("Harry Potter");
        requestDTO.setPrice(BigDecimal.valueOf(500));
        requestDTO.setStockQuantity(10);

        when(productRepository.existsByTitle(requestDTO.getTitle())).thenReturn(true);

        assertThrows(ProductAlreadyExistsException.class, () -> {
            productService.createProduct(requestDTO);
        });

        verify(productRepository, never()).save(any(Product.class));
    }


    @Test
    void updateProduct_ShouldThrowException_WhenProductNotFound() {
        Long nonExistentProductId = 999L; // non existing id
        ProductRequestDTO requestDTO = new ProductRequestDTO();
        requestDTO.setTitle("Новое название");

        when(productRepository.findById(nonExistentProductId)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () -> {
            productService.updateProduct(nonExistentProductId, requestDTO);
        });

        verify(productRepository, never()).save(any(Product.class));
    }
}