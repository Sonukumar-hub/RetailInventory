package com.stocksmart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_items")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(exclude = "purchaseOrder")
@ToString(exclude = "purchaseOrder")
public class PurchaseOrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity_ordered", nullable = false)
    private Integer quantityOrdered;

    @Builder.Default
    @Column(name = "quantity_received", nullable = false)
    private Integer quantityReceived = 0;

    @Column(name = "unit_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "line_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal;
}
