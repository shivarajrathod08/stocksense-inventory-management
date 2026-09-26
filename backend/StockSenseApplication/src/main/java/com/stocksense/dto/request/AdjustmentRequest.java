package com.stocksense.dto.request;

import jakarta.validation.constraints.*;

public record AdjustmentRequest(
        @NotNull(message = "Product is required") Long productId,
        @NotNull(message = "Location is required") Long locationId,
        @Min(value = 0, message = "Counted quantity cannot be negative") int countedQuantity,
        String reason
) {}
