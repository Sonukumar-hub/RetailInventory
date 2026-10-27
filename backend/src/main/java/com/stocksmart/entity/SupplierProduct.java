package com.stocksmart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "supplier_products",
    uniqueConstraints = @UniqueConstraint(columnNames = {"supplier_id","product_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierProduct {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "supplier_sku", length = 100)
    private String supplierSku;

    @Column(name = "unit_cost", precision = 15, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;
}
