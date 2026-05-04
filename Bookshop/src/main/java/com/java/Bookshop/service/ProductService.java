package com.java.Bookshop.service;

import com.java.Bookshop.DTO.ProductRequestDTO;
import com.java.Bookshop.DTO.ProductResponseDTO;
import com.java.Bookshop.Entity.Category;
import com.java.Bookshop.Entity.Product;
import com.java.Bookshop.Entity.Review;
import com.java.Bookshop.exception.CategoryNotFoundException;
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

import java.math.BigDecimal;
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
                .orElseThrow(() -> new CategoryNotFoundException("Category with ID " + dto.getCategoryId() + " not found"));

        Product newProduct = Product.builder()
                .description(dto.getDescription())
                .stockQuantity(dto.getStockQuantity())
                .price(dto.getPrice())
                .title(dto.getTitle())
                .imageKey(dto.getImageKey())
                .category(category)
                .author(dto.getAuthor())
                .discount(dto.getDiscount())
                .build();

        Product savedProduct = productRepository.save(newProduct);
        return mapToDTO(savedProduct);
    }

    public Page<ProductResponseDTO> getAllProducts(int page, int size, String sort, String search,
                                                   Long categoryId, String author,
                                                   BigDecimal minPrice, BigDecimal maxPrice, List<Long> ids) {

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction sortDirection = Sort.Direction.fromString(sortParams[1]);

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        boolean filterByIds = (ids != null && !ids.isEmpty());

        List<Long> safeIds = filterByIds ? ids : List.of(-1L);

        Page<Product> productPage = productRepository.findWithFilters(
                categoryId, author, search, minPrice, maxPrice, filterByIds, safeIds, pageable);

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
                .orElseThrow(() -> new CategoryNotFoundException("Category with ID " + dto.getCategoryId() + " not found"));

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
        product.setDiscount(dto.getDiscount());

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
                categoryName,
                product.getAuthor(),
                product.getDiscount(),
                avgRating
        );
    }

    public ProductResponseDTO getBanner() {
        return productRepository.findByIsBannerTrue()
                .map(this::mapToDTO)
                .orElse(null);
    }

    public void setBanner(Long productId) {
        productRepository.findByIsBannerTrue().ifPresent(oldBanner -> {
            oldBanner.setIsBanner(false);
            productRepository.save(oldBanner);
        });

        Product newBanner = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Book with ID " + productId + " was not found"));

        newBanner.setIsBanner(true);
        productRepository.save(newBanner);
    }
}