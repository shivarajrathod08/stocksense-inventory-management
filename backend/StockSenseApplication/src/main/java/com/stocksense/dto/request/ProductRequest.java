package com.stocksense.dto.request;

import jakarta.validation.constraints.*;

public record ProductRequest(
        @NotBlank(message = "Product name is required") String name,
        @NotBlank(message = "SKU is required") String sku,
        Long categoryId,
        @NotBlank(message = "Unit of measure is required") String unitOfMeasure,
        String description,
        @Min(value = 0, message = "Reorder point cannot be negative") int reorderPoint
) {}
