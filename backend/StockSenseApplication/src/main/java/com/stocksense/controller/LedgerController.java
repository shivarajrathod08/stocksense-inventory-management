package com.stocksense.controller;

import com.stocksense.dto.response.LedgerResponse;
import com.stocksense.service.LedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping
    public Page<LedgerResponse> list(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String operationType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ledgerService.list(productId, operationType, page, size);
    }
}
