package com.stocksense.repository;

import com.stocksense.entity.StockAdjustment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {

    @Query(value = """
        SELECT a FROM StockAdjustment a
        WHERE (:status IS NULL OR a.status = CAST(:status AS string))
        ORDER BY a.createdAt DESC
        """,
            countQuery = """
        SELECT count(a) FROM StockAdjustment a
        WHERE (:status IS NULL OR a.status = CAST(:status AS string))
        """)
    Page<StockAdjustment> findByFilters(@Param("status") String status, Pageable pageable);
}
