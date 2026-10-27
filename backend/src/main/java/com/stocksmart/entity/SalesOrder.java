package com.stocksmart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "sales_orders")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(exclude = "items")
@ToString(exclude = "items")
public class SalesOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "customer_name", length = 255)
    private String customerName;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String status = "PENDING";

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Builder.Default
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Builder.Default
    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesOrderItem> items = new ArrayList<>();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
