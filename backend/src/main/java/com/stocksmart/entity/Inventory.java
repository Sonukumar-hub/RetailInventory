package com.stocksmart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory",
    uniqueConstraints = @UniqueConstraint(columnNames = {"product_id","location_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Builder.Default
    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @Builder.Default
    @Column(name = "quantity_reserved", nullable = false)
    private Integer quantityReserved = 0;

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public int getAvailableQuantity() {
        return quantityOnHand - quantityReserved;
    }
}
