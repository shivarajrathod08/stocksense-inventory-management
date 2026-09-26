package com.stocksense.controller;

import com.stocksense.dto.request.DeliveryRequest;
import com.stocksense.dto.response.DeliveryResponse;
import com.stocksense.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    public Page<DeliveryResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return deliveryService.list(status, page, size);
    }

    @GetMapping("/{id}")
    public DeliveryResponse get(@PathVariable Long id) {
        return deliveryService.get(id);
    }

    @PostMapping
    public ResponseEntity<DeliveryResponse> create(@Valid @RequestBody DeliveryRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryService.create(req));
    }

    @PostMapping("/{id}/validate")
    public DeliveryResponse validate(@PathVariable Long id) {
        return deliveryService.validate(id);
    }
}
