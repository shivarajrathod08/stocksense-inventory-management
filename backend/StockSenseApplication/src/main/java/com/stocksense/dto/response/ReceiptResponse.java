package com.stocksense.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record ReceiptResponse(
        Long id,
        String reference,
        Long supplierId,
        String supplierName,
        Long destinationId,
        String destinationName,
        String warehouseName,
        String status,
        String notes,
        Long createdById,
        String createdByName,
        String validatedByName,
        LocalDateTime validatedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ItemLine> items
) {
    public record ItemLine(Long id, Long productId, String productName, String sku, int quantity) {}
}
