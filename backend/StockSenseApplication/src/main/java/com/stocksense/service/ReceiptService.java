package com.stocksense.service;

import com.stocksense.dto.request.ReceiptRequest;
import com.stocksense.dto.response.ReceiptResponse;
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
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final InventoryOperationService inventoryOps;

    @Transactional(readOnly = true)
    public Page<ReceiptResponse> list(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return receiptRepository.findByFilters(status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ReceiptResponse get(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ReceiptResponse create(ReceiptRequest req) {
        User currentUser = currentUser();
        Location destination = locationRepository.findById(req.destinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + req.destinationId()));

        Receipt receipt = Receipt.builder()
                .reference(generateReference("RCT"))
                .destination(destination)
                .supplier(req.supplierId() != null ? supplierRepository.findById(req.supplierId()).orElse(null) : null)
                .notes(req.notes())
                .status("DRAFT")
                .createdBy(currentUser)
                .build();

        for (ReceiptRequest.ItemLine line : req.items()) {
            Product product = productRepository.findById(line.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + line.productId()));

            ReceiptItem item = ReceiptItem.builder()
                    .receipt(receipt)
                    .product(product)
                    .quantity(line.quantity())
                    .build();

            receipt.getItems().add(item);
        }

        return toResponse(receiptRepository.save(receipt));
    }

    @Transactional
    public ReceiptResponse validate(Long id) {
        Receipt receipt = findById(id);
        User currentUser = currentUser();

        if (!"DRAFT".equals(receipt.getStatus())) {
            throw new BusinessException("Cannot validate receipt in status: " + receipt.getStatus());
        }

        // Increase stock for each line item, create ledger entries
        for (ReceiptItem item : receipt.getItems()) {
            inventoryOps.increaseStock(
                    item.getProduct(), receipt.getDestination(), item.getQuantity(),
                    "RECEIPT", receipt.getId(), "RECEIPT", currentUser
            );
        }

        receipt.setStatus("VALIDATED");
        receipt.setValidatedBy(currentUser);
        receipt.setValidatedAt(LocalDateTime.now());

        return toResponse(receiptRepository.save(receipt));
    }

    private Receipt findById(Long id) {
        return receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found: " + id));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Authenticated user not found"));
    }

    private String generateReference(String prefix) {
        return prefix + "-" + DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss").format(LocalDateTime.now());
    }

    private ReceiptResponse toResponse(Receipt r) {
        List<ReceiptResponse.ItemLine> lines = r.getItems().stream().map(item ->
                new ReceiptResponse.ItemLine(
                        item.getId(), item.getProduct().getId(),
                        item.getProduct().getName(), item.getProduct().getSku(),
                        item.getQuantity()
                )
        ).toList();

        Location dest = r.getDestination();
        return new ReceiptResponse(
                r.getId(), r.getReference(),
                r.getSupplier() != null ? r.getSupplier().getId() : null,
                r.getSupplier() != null ? r.getSupplier().getName() : null,
                dest.getId(), dest.getName(),
                dest.getWarehouse() != null ? dest.getWarehouse().getName() : null,
                r.getStatus(), r.getNotes(),
                r.getCreatedBy().getId(), r.getCreatedBy().getName(),
                r.getValidatedBy() != null ? r.getValidatedBy().getName() : null,
                r.getValidatedAt(), r.getCreatedAt(), r.getUpdatedAt(),
                lines
        );
    }
}
