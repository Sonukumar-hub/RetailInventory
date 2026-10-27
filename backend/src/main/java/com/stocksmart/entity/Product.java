package com.stocksmart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(unique = true, length = 100)
    private String barcode;

    @Builder.Default
    @Column(name = "unit_of_measure", nullable = false, length = 50)
    private String unitOfMeasure = "UNIT";

    @Builder.Default
    @Column(name = "cost_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "selling_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
