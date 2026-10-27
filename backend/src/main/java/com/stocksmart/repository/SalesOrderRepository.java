package com.stocksmart.repository;
import com.stocksmart.entity.SalesOrder;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    long countByStatus(String status);
    boolean existsByOrderNumber(String orderNumber);
    @Query("SELECT po FROM SalesOrder po WHERE (:status IS NULL OR po.status = :status) ORDER BY po.createdAt DESC")
    Page<SalesOrder> findByStatusFilter(@Param("status") String status, Pageable pageable);
    @Query("SELECT COALESCE(SUM(so.totalAmount), 0) FROM SalesOrder so WHERE so.status = 'COMPLETED' AND so.orderDate BETWEEN :from AND :to")
    BigDecimal sumRevenueByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(so.totalAmount), 0) FROM SalesOrder so WHERE so.status = 'COMPLETED'")
    BigDecimal sumTotalCompletedRevenue();
    long count();
}
