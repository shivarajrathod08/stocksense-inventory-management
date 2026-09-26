package com.stocksense.dto.response;

public record LocationResponse(Long id, Long warehouseId, String warehouseName, String name, String code, boolean active) {}
