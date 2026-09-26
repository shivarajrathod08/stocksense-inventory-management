package com.stocksense.dto.response;

import java.time.LocalDateTime;

public record InventoryResponse(
        Long id,
        Long productId,
        String productName,
        String sku,
        String unitOfMeasure,
        Long locationId,
        String locationName,
        String locationCode,
        Long warehouseId,
        String warehouseName,
        int quantity,
        int reorderPoint,
        boolean lowStock,
        LocalDateTime updatedAt
) {}
