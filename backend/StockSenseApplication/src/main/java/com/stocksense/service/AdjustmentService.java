package com.stocksense.service;

import com.stocksense.dto.request.AdjustmentRequest;
import com.stocksense.dto.response.AdjustmentResponse;
import com.stocksense.entity.*;
import com.stocksense.exception.*;
import com.stocksense.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AdjustmentService {

    private final StockAdjustmentRepository adjustmentRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final InventoryOperationService inventoryOps;

    @Transactional(readOnly = true)
    public Page<AdjustmentResponse> list(String status, int page, int size) {
        return adjustmentRepository.findByFilters(status, PageRequest.of(page, size)).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AdjustmentResponse get(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public AdjustmentResponse create(AdjustmentRequest req) {
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + req.productId()));
        Location location = locationRepository.findById(req.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + req.locationId()));

        // Read current stock to populate recorded_quantity
        int recorded = inventoryRepository
                .findByProductIdAndLocationId(product.getId(), location.getId())
                .map(Inventory::getQuantity)
                .orElse(0);

        int difference = req.countedQuantity() - recorded;

        StockAdjustment adjustment = StockAdjustment.builder()
                .reference(generateReference("ADJ"))
                .product(product)
                .location(location)
                .recordedQuantity(recorded)
                .countedQuantity(req.countedQuantity())
                .difference(difference)
                .reason(req.reason())
                .status("DRAFT")
                .createdBy(currentUser())
                .build();

        return toResponse(adjustmentRepository.save(adjustment));
    }

    @Transactional
    public AdjustmentResponse apply(Long id) {
        StockAdjustment adj = findById(id);
        User currentUser = currentUser();

        if (!"DRAFT".equals(adj.getStatus())) {
            throw new BusinessException("Cannot apply adjustment in status: " + adj.getStatus());
        }

        // Apply dynamically against current actual stock at apply time
        int actualDelta = inventoryOps.applyAdjustment(
                adj.getProduct(),
                adj.getLocation(),
                adj.getCountedQuantity(),
                adj.getId(),
                currentUser
        );

        adj.setDifference(actualDelta);
        adj.setStatus("APPLIED");
        adj.setAppliedBy(currentUser);
        adj.setAppliedAt(LocalDateTime.now());

        return toResponse(adjustmentRepository.save(adj));
    }

    private StockAdjustment findById(Long id) {
        return adjustmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adjustment not found: " + id));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Authenticated user not found"));
    }

    private String generateReference(String prefix) {
        return prefix + "-" + DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss").format(LocalDateTime.now());
    }

    private AdjustmentResponse toResponse(StockAdjustment a) {
        Location loc = a.getLocation();
        return new AdjustmentResponse(
                a.getId(), a.getReference(),
                a.getProduct().getId(), a.getProduct().getName(), a.getProduct().getSku(),
                loc.getId(), loc.getName(),
                loc.getWarehouse() != null ? loc.getWarehouse().getName() : null,
                a.getRecordedQuantity(), a.getCountedQuantity(), a.getDifference(),
                a.getReason(), a.getStatus(),
                a.getCreatedBy().getName(),
                a.getAppliedBy() != null ? a.getAppliedBy().getName() : null,
                a.getAppliedAt(), a.getCreatedAt()
        );
    }
}
