package com.stocksense.dto.response;

import java.util.List;

public record DashboardResponse(
        long totalProducts,
        long totalStockUnits,
        long lowStockCount,
        long outOfStockCount,
        long pendingReceipts,
        long pendingDeliveries,
        long pendingTransfers,
        List<LedgerResponse> recentMovements,
        List<LowStockItem> lowStockItems
) {
    public record LowStockItem(Long productId, String productName, String sku, int totalStock, int reorderPoint) {}
}
