package com.stocksense.repository;

import com.stocksense.entity.Transfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

    long countByStatus(String status);

    @Query(value = """
        SELECT t FROM Transfer t
        WHERE (:status IS NULL OR t.status = CAST(:status AS string))
        ORDER BY t.createdAt DESC
        """,
            countQuery = """
        SELECT count(t) FROM Transfer t
        WHERE (:status IS NULL OR t.status = CAST(:status AS string))
        """)
    Page<Transfer> findByFilters(@Param("status") String status, Pageable pageable);
}
