package com.stocksense.service;

import com.stocksense.dto.request.ProductRequest;
import com.stocksense.dto.response.ProductResponse;
import com.stocksense.entity.Category;
import com.stocksense.entity.Product;
import com.stocksense.exception.DuplicateResourceException;
import com.stocksense.exception.ResourceNotFoundException;
import com.stocksense.repository.CategoryRepository;
import com.stocksense.repository.InventoryRepository;
import com.stocksense.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(String search, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return productRepository.search(search, categoryId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        if (productRepository.existsBySku(req.sku())) {
            throw new DuplicateResourceException("SKU already exists: " + req.sku());
        }

        Product product = Product.builder()
                .name(req.name())
                .sku(req.sku().toUpperCase())
                .category(resolveCategory(req.categoryId()))
                .unitOfMeasure(req.unitOfMeasure())
                .description(req.description())
                .reorderPoint(req.reorderPoint())
                .active(true)
                .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product product = findById(id);

        if (productRepository.existsBySkuAndIdNot(req.sku(), id)) {
            throw new DuplicateResourceException("SKU already in use: " + req.sku());
        }

        product.setName(req.name());
        product.setSku(req.sku().toUpperCase());
        product.setCategory(resolveCategory(req.categoryId()));
        product.setUnitOfMeasure(req.unitOfMeasure());
        product.setDescription(req.description());
        product.setReorderPoint(req.reorderPoint());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = findById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
    }

    private ProductResponse toResponse(Product p) {
        int totalStock = inventoryRepository.totalStockByProduct(p.getId()).orElse(0);
        return new ProductResponse(
                p.getId(), p.getName(), p.getSku(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getUnitOfMeasure(), p.getDescription(), p.getReorderPoint(),
                p.isActive(), totalStock, p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
