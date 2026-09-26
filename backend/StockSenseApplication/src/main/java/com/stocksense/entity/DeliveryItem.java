package com.stocksense.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "delivery_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeliveryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;
}
