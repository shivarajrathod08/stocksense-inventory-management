package com.stocksense.repository;

import com.stocksense.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductIdAndLocationId(Long productId, Long locationId);

    // Lock inventory row during validation to prevent concurrent stock updates
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.location.id = :locationId")
    Optional<Inventory> findByProductAndLocationForUpdate(@Param("productId") Long productId,
                                                          @Param("locationId") Long locationId);

    List<Inventory> findByProductId(Long productId);

    List<Inventory> findByLocationId(Long locationId);

    @Query("""
        SELECT SUM(i.quantity) FROM Inventory i WHERE i.product.id = :productId
        """)
    Optional<Integer> totalStockByProduct(@Param("productId") Long productId);

    @Query("""
        SELECT i FROM Inventory i
        JOIN FETCH i.product p
        JOIN FETCH i.location l
        JOIN FETCH l.warehouse w
        WHERE p.active = true
        ORDER BY p.name, l.name
        """)
    List<Inventory> findAllWithDetails();

    // Products where total stock across all locations is below their reorder_point
    @Query("""
        SELECT i.product.id FROM Inventory i
        GROUP BY i.product.id, i.product.reorderPoint
        HAVING SUM(i.quantity) <= i.product.reorderPoint
        """)
    List<Long> findLowStockProductIds();

    // Products with zero stock everywhere
    @Query("""
        SELECT i.product.id FROM Inventory i
        GROUP BY i.product.id
        HAVING SUM(i.quantity) = 0
        """)
    List<Long> findOutOfStockProductIds();
}
