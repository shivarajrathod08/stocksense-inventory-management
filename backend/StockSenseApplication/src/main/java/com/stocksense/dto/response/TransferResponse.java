package com.stocksense.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record TransferResponse(
        Long id,
        String reference,
        Long sourceId,
        String sourceName,
        String sourceWarehouse,
        Long destinationId,
        String destinationName,
        String destinationWarehouse,
        String status,
        String notes,
        String createdByName,
        String completedByName,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ItemLine> items
) {
    public record ItemLine(Long id, Long productId, String productName, String sku, int quantity) {}
}
