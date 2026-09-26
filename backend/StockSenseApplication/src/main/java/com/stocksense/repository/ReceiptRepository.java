package com.stocksense.repository;

import com.stocksense.entity.Receipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    long countByStatus(String status);

    @Query(value = """
        SELECT r FROM Receipt r
        WHERE (:status IS NULL OR r.status = CAST(:status AS string))
        ORDER BY r.createdAt DESC
        """,
            countQuery = """
        SELECT count(r) FROM Receipt r
        WHERE (:status IS NULL OR r.status = CAST(:status AS string))
        """)
    Page<Receipt> findByFilters(@Param("status") String status, Pageable pageable);
}
