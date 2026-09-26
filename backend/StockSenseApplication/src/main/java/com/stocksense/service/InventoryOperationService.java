package com.stocksense.service;

import com.stocksense.entity.*;
import com.stocksense.exception.BusinessException;
import com.stocksense.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Shared inventory mutation logic. All operations that change stock
 * must go through these methods so that:
 * 1. Inventory rows are locked before modification.
 * 2. Ledger entries are always created.
 * 3. Negative stock is prevented.
 */
@Service
@RequiredArgsConstructor
public class InventoryOperationService {

    private final InventoryRepository inventoryRepository;
    private final StockLedgerRepository ledgerRepository;

    /**
     * Increase stock at a given location and write a ledger entry.
     * If no inventory row exists for this product/location, create one.
     */
    public void increaseStock(Product product, Location location, int qty,
                              String operationType, Long referenceId, String referenceType,
                              User performedBy) {
        Inventory inv = findOrCreate(product, location);
        inv.setQuantity(inv.getQuantity() + qty);
        inventoryRepository.save(inv);

        recordLedger(product, null, location, operationType, referenceId, referenceType,
                qty, inv.getQuantity(), performedBy);
    }

    /**
     * Decrease stock at a given location. Throws if stock is insufficient.
     */
    public void decreaseStock(Product product, Location location, int qty,
                              String operationType, Long referenceId, String referenceType,
                              User performedBy) {
        Inventory inv = inventoryRepository
                .findByProductAndLocationForUpdate(product.getId(), location.getId())
                .orElseThrow(() -> new BusinessException(
                        "No stock found for " + product.getName() + " at " + location.getName()));

        if (inv.getQuantity() < qty) {
            throw new BusinessException(
                    "Insufficient stock for " + product.getName() +
                            ". Available: " + inv.getQuantity() + ", Requested: " + qty);
        }

        inv.setQuantity(inv.getQuantity() - qty);
        inventoryRepository.save(inv);

        recordLedger(product, location, null, operationType, referenceId, referenceType,
                -qty, inv.getQuantity(), performedBy);
    }

    /**
     * Apply an adjustment atomically with pessimistic locking.
     * Calculates delta against current actual stock at apply-time,
     * prevents negative stock, updates inventory to countedQuantity,
     * and writes the accurate ledger entry.
     * Returns the actual applied delta.
     */
    public int applyAdjustment(Product product, Location location,
                               int countedQty,
                               Long referenceId, User performedBy) {
        if (countedQty < 0) {
            throw new BusinessException("Counted quantity cannot be negative: " + countedQty);
        }

        Inventory inv = findOrCreate(product, location);
        int currentActual = inv.getQuantity();
        int delta = countedQty - currentActual;

        inv.setQuantity(countedQty);
        inventoryRepository.save(inv);

        recordLedger(product,
                delta < 0 ? location : null,
                delta > 0 ? location : null,
                "ADJUSTMENT", referenceId, "ADJUSTMENT",
                delta, countedQty, performedBy);

        return delta;
    }

    /**
     * Overloaded method for backwards compatibility.
     */
    public void applyAdjustment(Product product, Location location,
                                int currentQty, int newQty,
                                Long referenceId, User performedBy) {
        applyAdjustment(product, location, newQty, referenceId, performedBy);
    }

    private Inventory findOrCreate(Product product, Location location) {
        return inventoryRepository
                .findByProductAndLocationForUpdate(product.getId(), location.getId())
                .orElseGet(() -> Inventory.builder()
                        .product(product)
                        .location(location)
                        .quantity(0)
                        .build());
    }

    private void recordLedger(Product product, Location source, Location dest,
                              String operationType, Long referenceId, String referenceType,
                              int quantityChange, int resultingQty, User performedBy) {
        StockLedger entry = StockLedger.builder()
                .product(product)
                .sku(product.getSku())
                .operationType(operationType)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .sourceLocation(source)
                .destLocation(dest)
                .quantityChange(quantityChange)
                .resultingQuantity(resultingQty)
                .performedBy(performedBy)
                .build();

        ledgerRepository.save(entry);
    }
}
