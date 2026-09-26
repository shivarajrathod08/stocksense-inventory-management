package com.stocksense.controller;

import com.stocksense.dto.request.AdjustmentRequest;
import com.stocksense.dto.response.AdjustmentResponse;
import com.stocksense.service.AdjustmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adjustments")
@RequiredArgsConstructor
public class AdjustmentController {

    private final AdjustmentService adjustmentService;

    @GetMapping
    public Page<AdjustmentResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adjustmentService.list(status, page, size);
    }

    @GetMapping("/{id}")
    public AdjustmentResponse get(@PathVariable Long id) {
        return adjustmentService.get(id);
    }

    @PostMapping
    public ResponseEntity<AdjustmentResponse> create(@Valid @RequestBody AdjustmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adjustmentService.create(req));
    }

    @PostMapping("/{id}/apply")
    public AdjustmentResponse apply(@PathVariable Long id) {
        return adjustmentService.apply(id);
    }
}
