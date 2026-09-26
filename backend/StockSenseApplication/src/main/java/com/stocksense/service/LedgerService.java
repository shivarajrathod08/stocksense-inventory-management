package com.stocksense.service;

import com.stocksense.dto.response.LedgerResponse;
import com.stocksense.entity.StockLedger;
import com.stocksense.repository.StockLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final StockLedgerRepository ledgerRepository;

    @Transactional(readOnly = true)
    public Page<LedgerResponse> list(Long productId, String operationType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ledgerRepository.findByFilters(productId, operationType, pageable)
                .map(this::toResponse);
    }

    LedgerResponse toResponse(StockLedger l) {
        return new LedgerResponse(
                l.getId(), l.getCreatedAt(),
                l.getProduct().getId(), l.getProduct().getName(), l.getSku(),
                l.getOperationType(), l.getReferenceId(), l.getReferenceType(),
                l.getSourceLocation() != null ? l.getSourceLocation().getId() : null,
                l.getSourceLocation() != null ? l.getSourceLocation().getName() : null,
                l.getDestLocation() != null ? l.getDestLocation().getId() : null,
                l.getDestLocation() != null ? l.getDestLocation().getName() : null,
                l.getQuantityChange(), l.getResultingQuantity(),
                l.getPerformedBy() != null ? l.getPerformedBy().getName() : null
        );
    }
}
