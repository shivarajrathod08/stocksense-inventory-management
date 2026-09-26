package com.stocksense.service;

import com.stocksense.dto.request.TransferRequest;
import com.stocksense.dto.response.TransferResponse;
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

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final InventoryOperationService inventoryOps;

    @Transactional(readOnly = true)
    public Page<TransferResponse> list(String status, int page, int size) {
        return transferRepository.findByFilters(status, PageRequest.of(page, size)).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TransferResponse get(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public TransferResponse create(TransferRequest req) {
        if (req.sourceId().equals(req.destinationId())) {
            throw new BusinessException("Source and destination locations cannot be the same");
        }

        Location source = locationRepository.findById(req.sourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Source location not found"));
        Location destination = locationRepository.findById(req.destinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found"));

        Transfer transfer = Transfer.builder()
                .reference(generateReference("TRN"))
                .source(source)
                .destination(destination)
                .notes(req.notes())
                .status("DRAFT")
                .createdBy(currentUser())
                .build();

        for (TransferRequest.ItemLine line : req.items()) {
            Product product = productRepository.findById(line.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + line.productId()));

            transfer.getItems().add(TransferItem.builder()
                    .transfer(transfer)
                    .product(product)
                    .quantity(line.quantity())
                    .build());
        }

        return toResponse(transferRepository.save(transfer));
    }

    @Transactional
    public TransferResponse complete(Long id) {
        Transfer transfer = findById(id);
        User currentUser = currentUser();

        if (!"DRAFT".equals(transfer.getStatus())) {
            throw new BusinessException("Cannot complete transfer in status: " + transfer.getStatus());
        }

        // Both decrease (source) and increase (destination) happen atomically.
        // If source stock is insufficient, the whole transaction rolls back.
        for (TransferItem item : transfer.getItems()) {
            inventoryOps.decreaseStock(
                    item.getProduct(), transfer.getSource(), item.getQuantity(),
                    "TRANSFER_OUT", transfer.getId(), "TRANSFER", currentUser
            );
            inventoryOps.increaseStock(
                    item.getProduct(), transfer.getDestination(), item.getQuantity(),
                    "TRANSFER_IN", transfer.getId(), "TRANSFER", currentUser
            );
        }

        transfer.setStatus("COMPLETED");
        transfer.setCompletedBy(currentUser);
        transfer.setCompletedAt(LocalDateTime.now());

        return toResponse(transferRepository.save(transfer));
    }

    private Transfer findById(Long id) {
        return transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + id));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Authenticated user not found"));
    }

    private String generateReference(String prefix) {
        return prefix + "-" + DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss").format(LocalDateTime.now());
    }

    private TransferResponse toResponse(Transfer t) {
        List<TransferResponse.ItemLine> lines = t.getItems().stream().map(item ->
                new TransferResponse.ItemLine(
                        item.getId(), item.getProduct().getId(),
                        item.getProduct().getName(), item.getProduct().getSku(),
                        item.getQuantity()
                )
        ).toList();

        return new TransferResponse(
                t.getId(), t.getReference(),
                t.getSource().getId(), t.getSource().getName(),
                t.getSource().getWarehouse() != null ? t.getSource().getWarehouse().getName() : null,
                t.getDestination().getId(), t.getDestination().getName(),
                t.getDestination().getWarehouse() != null ? t.getDestination().getWarehouse().getName() : null,
                t.getStatus(), t.getNotes(),
                t.getCreatedBy().getName(),
                t.getCompletedBy() != null ? t.getCompletedBy().getName() : null,
                t.getCompletedAt(), t.getCreatedAt(), t.getUpdatedAt(),
                lines
        );
    }
}
