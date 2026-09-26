package com.stocksense.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record DeliveryResponse(
        Long id,
        String reference,
        Long sourceId,
        String sourceName,
        String warehouseName,
        String status,
        String notes,
        String createdByName,
        String validatedByName,
        LocalDateTime validatedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ItemLine> items
) {
    public record ItemLine(Long id, Long productId, String productName, String sku, int quantity) {}
}
