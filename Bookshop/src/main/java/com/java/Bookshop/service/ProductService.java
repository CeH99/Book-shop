package com.java.Bookshop.service;

import com.java.Bookshop.DTO.ProductRequestDTO;
import com.java.Bookshop.DTO.ProductResponseDTO;
import com.java.Bookshop.Entity.Product;
import com.java.Bookshop.exception.ProductAlreadyExistsException;
import com.java.Bookshop.exception.ProductNotFoundException;
import com.java.Bookshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    // ! TEMPORARY
    private final String MOCK_IMAGE_URL = "https://m.media-amazon.com/images/I/81q77Q39nHL.jpg"; // !!!!

    public ProductResponseDTO createProduct(ProductRequestDTO dto) {
        if(productRepository.existsByTitle(dto.getTitle())) {
            throw new ProductAlreadyExistsException("Product with this title already exists");
        }

        Product newProduct = Product.builder()
                .description(dto.getDescription())
                .stockQuantity(dto.getStockQuantity())
                .price(dto.getPrice())
                .title(dto.getTitle())
                .imageKey(dto.getImageKey()) // !!!
                .build();

        Product savedProduct = productRepository.save(newProduct);

        return new ProductResponseDTO(
                savedProduct.getId(), savedProduct.getTitle(), savedProduct.getDescription(),
                savedProduct.getPrice(), savedProduct.getStockQuantity(), MOCK_IMAGE_URL); // !!!
    }

    public Page<ProductResponseDTO> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Product> productPage = productRepository.findAll(pageable);

        return productPage.map(product -> new ProductResponseDTO(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageKey() // !!!
        ));
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Book with ID " + id + " was not found"));

        return new ProductResponseDTO(product.getId(), product.getTitle(),
                product.getDescription(), product.getPrice(), product.getStockQuantity(), MOCK_IMAGE_URL); // !!!
        }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Book with ID " + id + " was not found"));

        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());

        Product savedProduct = productRepository.save(product);

        return new ProductResponseDTO(savedProduct.getId(), savedProduct.getTitle(),
                savedProduct.getDescription(), savedProduct.getPrice(), savedProduct.getStockQuantity(), MOCK_IMAGE_URL); // !!!
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Book with ID " + id + " was not found"));

        productRepository.delete(product);
    }
}
