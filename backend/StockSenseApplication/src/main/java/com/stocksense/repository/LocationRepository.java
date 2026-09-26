package com.stocksense.repository;

import com.stocksense.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByWarehouseId(Long warehouseId);
    List<Location> findByActiveTrue();
}
