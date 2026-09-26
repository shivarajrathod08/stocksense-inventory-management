package com.stocksense.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record ReceiptRequest(
        Long supplierId,
        @NotNull(message = "Destination location is required") Long destinationId,
        String notes,
        @NotEmpty(message = "Receipt must contain at least one item")
        @Valid List<ItemLine> items
) {
    public record ItemLine(
            @NotNull(message = "Product is required") Long productId,
            @Min(value = 1, message = "Quantity must be greater than 0") int quantity
    ) {}
}
