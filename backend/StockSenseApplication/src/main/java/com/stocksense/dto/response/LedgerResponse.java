package com.stocksense.dto.response;

import java.time.LocalDateTime;

public record LedgerResponse(
        Long id,
        LocalDateTime createdAt,
        Long productId,
        String productName,
        String sku,
        String operationType,
        Long referenceId,
        String referenceType,
        Long sourceLocationId,
        String sourceLocationName,
        Long destLocationId,
        String destLocationName,
        int quantityChange,
        int resultingQuantity,
        String performedByName
) {}
