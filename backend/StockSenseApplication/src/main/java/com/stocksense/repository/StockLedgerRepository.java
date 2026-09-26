package com.stocksense.repository;

import com.stocksense.entity.StockLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {

    @Query(value = """
        SELECT l FROM StockLedger l
        WHERE (:productId IS NULL OR l.product.id = :productId)
        AND (:operationType IS NULL OR l.operationType = CAST(:operationType AS string))
        ORDER BY l.createdAt DESC
        """,
            countQuery = """
        SELECT count(l) FROM StockLedger l
        WHERE (:productId IS NULL OR l.product.id = :productId)
        AND (:operationType IS NULL OR l.operationType = CAST(:operationType AS string))
        """)
    Page<StockLedger> findByFilters(@Param("productId") Long productId,
                                    @Param("operationType") String operationType,
                                    Pageable pageable);

    List<StockLedger> findTop10ByOrderByCreatedAtDesc();
}
