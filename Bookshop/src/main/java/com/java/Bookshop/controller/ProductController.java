package com.java.Bookshop.controller;

import com.java.Bookshop.DTO.ProductRequestDTO;
import com.java.Bookshop.DTO.ProductResponseDTO;
import com.java.Bookshop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ProductResponseDTO addProduct(@Valid @RequestBody ProductRequestDTO dto) {
        return productService.createProduct(dto);
    }

    @GetMapping
    public Page<ProductResponseDTO> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "id,desc") String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Long> ids
    ) {
        return productService.getAllProducts(page, size, sort, search, categoryId, author, minPrice, maxPrice, ids);
    }

    @GetMapping("/authors")
    public List<String> getAllAuthors() {
        return productService.getAllAuthors();
    }

    @GetMapping("/{productId}")
    public ProductResponseDTO getProductById(@PathVariable Long productId) {
        return productService.getProductById(productId);
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ProductResponseDTO updateProduct(@PathVariable Long productId,
                                            @Valid @RequestBody ProductRequestDTO dto) {
        return productService.updateProduct(productId, dto);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
    }


    @GetMapping("/banner")
    public ResponseEntity<ProductResponseDTO> getBanner() {
        ProductResponseDTO banner = productService.getBanner();
        if (banner != null) {
            return ResponseEntity.ok(banner);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @PutMapping("/banner/{productId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> setBanner(@PathVariable Long productId) {
        productService.setBanner(productId);
        return ResponseEntity.ok().build();
    }
}
