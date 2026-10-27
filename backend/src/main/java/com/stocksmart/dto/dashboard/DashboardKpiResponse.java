package com.stocksmart.dto.dashboard;
import java.math.BigDecimal;
public record DashboardKpiResponse(
    long totalActiveProducts,
    long totalLocations,
    long totalInventoryUnits,
    long lowStockCount,
    long outOfStockCount,
    long totalSuppliers,
    long pendingPurchaseOrders,
    long totalSalesOrders,
    BigDecimal totalRevenue
) {}
