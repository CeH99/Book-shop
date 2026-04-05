package com.java.Bookshop.service;

import com.java.Bookshop.DTO.ProductRequestDTO;
import com.java.Bookshop.DTO.ProductResponseDTO;
import com.java.Bookshop.Entity.Category;
import com.java.Bookshop.Entity.Product;
import com.java.Bookshop.exception.ProductAlreadyExistsException;
import com.java.Bookshop.exception.ProductNotFoundException;
import com.java.Bookshop.repository.CategoryRepository;
import com.java.Bookshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileService fileService;

    public ProductResponseDTO createProduct(ProductRequestDTO dto) {
        if(productRepository.existsByTitle(dto.getTitle())) {
            throw new ProductAlreadyExistsException("Product with this title already exists");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product newProduct = Product.builder()
                .description(dto.getDescription())
                .stockQuantity(dto.getStockQuantity())
                .price(dto.getPrice())
                .title(dto.getTitle())
                .imageKey(dto.getImageKey())
                .category(category)
                .author(dto.getAuthor())
                .build();

        Product savedProduct = productRepository.save(newProduct);
        return mapToDTO(savedProduct);
    }

    public Page<ProductResponseDTO> getAllProducts(int page, int size, String sort, String search, Long categoryId, String author) { // <-- ДОДАНО author

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction sortDirection = Sort.Direction.fromString(sortParams[1]);

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        Page<Product> productPage;

        if (categoryId != null) {
            productPage = productRepository.findByCategoryId(categoryId, pageable);
        } else if (author != null && !author.trim().isEmpty()) {
            productPage = productRepository.findByAuthor(author, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            productPage = productRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }

        return productPage.map(this::mapToDTO);
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Book with ID " + id + " was not found"));

        return mapToDTO(product);
    }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Book with ID " + id + " was not found"));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (product.getImageKey() != null && !product.getImageKey().equals(dto.getImageKey())) {
            fileService.deleteFileFromS3(product.getImageKey());
        }

        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageKey(dto.getImageKey());
        product.setCategory(category);
        product.setAuthor(dto.getAuthor());

        Product savedProduct = productRepository.save(product);
        return mapToDTO(savedProduct);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Book with ID " + id + " was not found"));

        if (product.getImageKey() != null) {
            fileService.deleteFileFromS3(product.getImageKey());
        }

        productRepository.delete(product);
    }

    public List<String> getAllAuthors() {
        return productRepository.findAllDistinctAuthors();
    }

    private ProductResponseDTO mapToDTO(Product product) {
        String categoryName = product.getCategory() != null ? product.getCategory().getName() : "Без категорії";

        return new ProductResponseDTO(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageKey(),
                categoryName,
                product.getAuthor()
        );
    }
}