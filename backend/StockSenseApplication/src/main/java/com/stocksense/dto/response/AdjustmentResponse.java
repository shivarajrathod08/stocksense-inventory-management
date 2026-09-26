package com.stocksense.dto.response;

import java.time.LocalDateTime;

public record AdjustmentResponse(
        Long id,
        String reference,
        Long productId,
        String productName,
        String sku,
        Long locationId,
        String locationName,
        String warehouseName,
        int recordedQuantity,
        int countedQuantity,
        int difference,
        String reason,
        String status,
        String createdByName,
        String appliedByName,
        LocalDateTime appliedAt,
        LocalDateTime createdAt
) {}
