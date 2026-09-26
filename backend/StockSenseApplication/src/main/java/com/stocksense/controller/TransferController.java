package com.stocksense.controller;

import com.stocksense.dto.request.TransferRequest;
import com.stocksense.dto.response.TransferResponse;
import com.stocksense.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @GetMapping
    public Page<TransferResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return transferService.list(status, page, size);
    }

    @GetMapping("/{id}")
    public TransferResponse get(@PathVariable Long id) {
        return transferService.get(id);
    }

    @PostMapping
    public ResponseEntity<TransferResponse> create(@Valid @RequestBody TransferRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transferService.create(req));
    }

    @PostMapping("/{id}/complete")
    public TransferResponse complete(@PathVariable Long id) {
        return transferService.complete(id);
    }
}
