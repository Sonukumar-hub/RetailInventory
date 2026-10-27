package com.stocksmart.service;

import com.stocksmart.dto.dashboard.DashboardKpiResponse;
import com.stocksmart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SalesOrderRepository salesOrderRepository;

    @Transactional(readOnly = true)
    public DashboardKpiResponse getKpis() {
        long totalProducts = productRepository.countByActiveTrue();
        long totalLocations = locationRepository.countByActiveTrue();
        long totalInventory = inventoryRepository.sumTotalQuantity();
        long lowStock = productRepository.countLowStockProducts();
        long outOfStock = productRepository.countOutOfStockProducts();
        long totalSuppliers = supplierRepository.countByActiveTrue();
        long pendingPOs = purchaseOrderRepository.countByStatusIn(List.of("DRAFT", "ORDERED", "PARTIALLY_RECEIVED"));
        long totalSOs = salesOrderRepository.count();
        BigDecimal revenue = salesOrderRepository.sumRevenueByDateRange(
                LocalDate.now().minusMonths(1), LocalDate.now());
        if (revenue == null || revenue.compareTo(BigDecimal.ZERO) == 0) {
            revenue = salesOrderRepository.sumTotalCompletedRevenue();
        }

        return new DashboardKpiResponse(totalProducts, totalLocations, totalInventory,
                lowStock, outOfStock, totalSuppliers, pendingPOs, totalSOs,
                revenue != null ? revenue : BigDecimal.ZERO);
    }
}
