package com.stocksense.service;

import com.stocksense.dto.response.DashboardResponse;
import com.stocksense.dto.response.LedgerResponse;
import com.stocksense.entity.Product;
import com.stocksense.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ReceiptRepository receiptRepository;
    private final DeliveryRepository deliveryRepository;
    private final TransferRepository transferRepository;
    private final StockLedgerRepository ledgerRepository;
    private final LedgerService ledgerService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long totalProducts = productRepository.countByActiveTrue();
        long totalStockUnits = inventoryRepository.findAll().stream()
                .mapToLong(i -> i.getQuantity()).sum();

        List<Long> lowStockIds = inventoryRepository.findLowStockProductIds();
        List<Long> outOfStockIds = inventoryRepository.findOutOfStockProductIds();

        long pendingReceipts   = receiptRepository.countByStatus("DRAFT");
        long pendingDeliveries = deliveryRepository.countByStatus("DRAFT");
        long pendingTransfers  = transferRepository.countByStatus("DRAFT");

        List<LedgerResponse> recentMovements = ledgerRepository.findTop10ByOrderByCreatedAtDesc()
                .stream().map(ledgerService::toResponse).toList();

        List<DashboardResponse.LowStockItem> lowStockItems = productRepository
                .findAllById(lowStockIds).stream()
                .map(p -> {
                    int stock = inventoryRepository.totalStockByProduct(p.getId()).orElse(0);
                    return new DashboardResponse.LowStockItem(
                            p.getId(), p.getName(), p.getSku(), stock, p.getReorderPoint()
                    );
                }).toList();

        return new DashboardResponse(
                totalProducts, totalStockUnits,
                lowStockIds.size(), outOfStockIds.size(),
                pendingReceipts, pendingDeliveries, pendingTransfers,
                recentMovements, lowStockItems
        );
    }
}
