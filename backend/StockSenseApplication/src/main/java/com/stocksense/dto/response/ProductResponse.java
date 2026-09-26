package com.stocksense.dto.response;

import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String name,
        String sku,
        Long categoryId,
        String categoryName,
        String unitOfMeasure,
        String description,
        int reorderPoint,
        boolean active,
        int totalStock,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
