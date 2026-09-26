package com.stocksense.controller;

import com.stocksense.dto.response.LocationResponse;
import com.stocksense.dto.response.WarehouseResponse;
import com.stocksense.entity.*;
import com.stocksense.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReferenceDataController {

    private final WarehouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping("/warehouses")
    @Transactional(readOnly = true)
    public List<WarehouseResponse> listWarehouses() {
        return warehouseRepository.findByActiveTrue().stream()
                .map(w -> new WarehouseResponse(w.getId(), w.getName(), w.getAddress(), w.isActive()))
                .toList();
    }

    @GetMapping("/warehouses/{id}/locations")
    @Transactional(readOnly = true)
    public List<LocationResponse> locationsByWarehouse(@PathVariable Long id) {
        return locationRepository.findByWarehouseId(id).stream()
                .map(l -> new LocationResponse(l.getId(),
                        l.getWarehouse().getId(), l.getWarehouse().getName(),
                        l.getName(), l.getCode(), l.isActive()))
                .toList();
    }

    @GetMapping("/locations")
    @Transactional(readOnly = true)
    public List<LocationResponse> listLocations() {
        return locationRepository.findByActiveTrue().stream()
                .map(l -> new LocationResponse(l.getId(),
                        l.getWarehouse() != null ? l.getWarehouse().getId() : null,
                        l.getWarehouse() != null ? l.getWarehouse().getName() : null,
                        l.getName(), l.getCode(), l.isActive()))
                .toList();
    }

    @GetMapping("/categories")
    public List<Category> listCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/suppliers")
    public List<Supplier> listSuppliers() {
        return supplierRepository.findAll();
    }
}
