package com.stocksense.service;

import com.stocksense.dto.request.DeliveryRequest;
import com.stocksense.dto.response.DeliveryResponse;
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
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final InventoryOperationService inventoryOps;

    @Transactional(readOnly = true)
    public Page<DeliveryResponse> list(String status, int page, int size) {
        return deliveryRepository.findByFilters(status, PageRequest.of(page, size)).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DeliveryResponse get(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public DeliveryResponse create(DeliveryRequest req) {
        User currentUser = currentUser();
        Location source = locationRepository.findById(req.sourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + req.sourceId()));

        Delivery delivery = Delivery.builder()
                .reference(generateReference("DLV"))
                .source(source)
                .notes(req.notes())
                .status("DRAFT")
                .createdBy(currentUser)
                .build();

        for (DeliveryRequest.ItemLine line : req.items()) {
            Product product = productRepository.findById(line.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + line.productId()));

            delivery.getItems().add(DeliveryItem.builder()
                    .delivery(delivery)
                    .product(product)
                    .quantity(line.quantity())
                    .build());
        }

        return toResponse(deliveryRepository.save(delivery));
    }

    @Transactional
    public DeliveryResponse validate(Long id) {
        Delivery delivery = findById(id);
        User currentUser = currentUser();

        if (!"DRAFT".equals(delivery.getStatus())) {
            throw new BusinessException("Cannot validate delivery in status: " + delivery.getStatus());
        }

        // Decrease stock — will throw if insufficient for any item
        for (DeliveryItem item : delivery.getItems()) {
            inventoryOps.decreaseStock(
                    item.getProduct(), delivery.getSource(), item.getQuantity(),
                    "DELIVERY", delivery.getId(), "DELIVERY", currentUser
            );
        }

        delivery.setStatus("VALIDATED");
        delivery.setValidatedBy(currentUser);
        delivery.setValidatedAt(LocalDateTime.now());

        return toResponse(deliveryRepository.save(delivery));
    }

    private Delivery findById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + id));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Authenticated user not found"));
    }

    private String generateReference(String prefix) {
        return prefix + "-" + DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss").format(LocalDateTime.now());
    }

    private DeliveryResponse toResponse(Delivery d) {
        List<DeliveryResponse.ItemLine> lines = d.getItems().stream().map(item ->
                new DeliveryResponse.ItemLine(
                        item.getId(), item.getProduct().getId(),
                        item.getProduct().getName(), item.getProduct().getSku(),
                        item.getQuantity()
                )
        ).toList();

        Location src = d.getSource();
        return new DeliveryResponse(
                d.getId(), d.getReference(),
                src.getId(), src.getName(),
                src.getWarehouse() != null ? src.getWarehouse().getName() : null,
                d.getStatus(), d.getNotes(),
                d.getCreatedBy().getName(),
                d.getValidatedBy() != null ? d.getValidatedBy().getName() : null,
                d.getValidatedAt(), d.getCreatedAt(), d.getUpdatedAt(),
                lines
        );
    }
}
