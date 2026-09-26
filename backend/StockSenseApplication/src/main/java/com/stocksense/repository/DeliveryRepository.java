package com.stocksense.repository;

import com.stocksense.entity.Delivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    long countByStatus(String status);

    @Query(value = """
        SELECT d FROM Delivery d
        WHERE (:status IS NULL OR d.status = CAST(:status AS string))
        ORDER BY d.createdAt DESC
        """,
            countQuery = """
        SELECT count(d) FROM Delivery d
        WHERE (:status IS NULL OR d.status = CAST(:status AS string))
        """)
    Page<Delivery> findByFilters(@Param("status") String status, Pageable pageable);
}
