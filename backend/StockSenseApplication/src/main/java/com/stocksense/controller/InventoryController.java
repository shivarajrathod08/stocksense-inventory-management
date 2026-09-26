package com.stocksense.controller;

import com.stocksense.dto.response.InventoryResponse;
import com.stocksense.entity.Inventory;
import com.stocksense.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    @GetMapping
    public List<InventoryResponse> list() {
        return inventoryRepository.findAllWithDetails().stream()
                .map(this::toResponse)
                .toList();
    }

    private InventoryResponse toResponse(Inventory inv) {
        boolean lowStock = inv.getQuantity() <= inv.getProduct().getReorderPoint();
        return new InventoryResponse(
                inv.getId(),
                inv.getProduct().getId(),
                inv.getProduct().getName(),
                inv.getProduct().getSku(),
                inv.getProduct().getUnitOfMeasure(),
                inv.getLocation().getId(),
                inv.getLocation().getName(),
                inv.getLocation().getCode(),
                inv.getLocation().getWarehouse() != null ? inv.getLocation().getWarehouse().getId() : null,
                inv.getLocation().getWarehouse() != null ? inv.getLocation().getWarehouse().getName() : null,
                inv.getQuantity(),
                inv.getProduct().getReorderPoint(),
                lowStock,
                inv.getUpdatedAt()
        );
    }
}
