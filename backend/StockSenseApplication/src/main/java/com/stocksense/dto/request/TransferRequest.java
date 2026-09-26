package com.stocksense.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record TransferRequest(
        @NotNull(message = "Source location is required") Long sourceId,
        @NotNull(message = "Destination location is required") Long destinationId,
        String notes,
        @NotEmpty(message = "Transfer must contain at least one item")
        @Valid List<ItemLine> items
) {
    public record ItemLine(
            @NotNull Long productId,
            @Min(value = 1, message = "Quantity must be greater than 0") int quantity
    ) {}
}
