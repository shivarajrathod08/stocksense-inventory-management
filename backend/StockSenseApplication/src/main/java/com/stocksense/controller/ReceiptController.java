package com.stocksense.controller;

import com.stocksense.dto.request.ReceiptRequest;
import com.stocksense.dto.response.ReceiptResponse;
import com.stocksense.service.ReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @GetMapping
    public Page<ReceiptResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return receiptService.list(status, page, size);
    }

    @GetMapping("/{id}")
    public ReceiptResponse get(@PathVariable Long id) {
        return receiptService.get(id);
    }

    @PostMapping
    public ResponseEntity<ReceiptResponse> create(@Valid @RequestBody ReceiptRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(receiptService.create(req));
    }

    @PostMapping("/{id}/validate")
    public ReceiptResponse validate(@PathVariable Long id) {
        return receiptService.validate(id);
    }
}
