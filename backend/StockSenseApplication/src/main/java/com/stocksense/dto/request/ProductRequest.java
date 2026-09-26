package com.stocksense.dto.request;

import jakarta.validation.constraints.*;

public record ProductRequest(
        @NotBlank(message = "Product name is required") String name,
        @NotBlank(message = "SKU is required") String sku,
        Long categoryId,
        @NotBlank(message = "Unit of measure is required") String unitOfMeasure,
        String description,
        @Min(value = 0, message = "Reorder point cannot be negative") int reorderPoint,
        @Min(value = 0, message = "Initial stock cannot be negative") Integer initialStock,
        Long initialLocationId
) {
    public ProductRequest(String name, String sku, Long categoryId, String unitOfMeasure, String description, int reorderPoint) {
        this(name, sku, categoryId, unitOfMeasure, description, reorderPoint, null, null);
    }
}
