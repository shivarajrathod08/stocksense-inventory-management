package com.stocksense.repository;

import com.stocksense.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    Optional<Product> findBySku(String sku);

    long countByActiveTrue();

    @Query(value = """
        SELECT p FROM Product p
        LEFT JOIN FETCH p.category
        WHERE p.active = true
        AND (:search IS NULL
             OR LOWER(p.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')
             OR LOWER(p.sku)  LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%'))
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        """,
            countQuery = """
        SELECT count(p) FROM Product p
        WHERE p.active = true
        AND (:search IS NULL
             OR LOWER(p.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')
             OR LOWER(p.sku)  LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%'))
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        """)
    Page<Product> search(@Param("search") String search,
                         @Param("categoryId") Long categoryId,
                         Pageable pageable);
}
