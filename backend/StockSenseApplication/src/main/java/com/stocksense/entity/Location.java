package com.stocksense.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locations", uniqueConstraints = @UniqueConstraint(columnNames = {"warehouse_id", "name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String code;

    @Column(nullable = false)
    private boolean active = true;
}
