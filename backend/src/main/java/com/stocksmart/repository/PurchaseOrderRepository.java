package com.stocksmart.repository;
import com.stocksmart.entity.PurchaseOrder;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    long countByStatusIn(java.util.List<String> statuses);
    @Query("SELECT po FROM PurchaseOrder po WHERE (:status IS NULL OR po.status = :status) ORDER BY po.createdAt DESC")
    Page<PurchaseOrder> findByStatusFilter(@Param("status") String status, Pageable pageable);
    boolean existsByOrderNumber(String orderNumber);
}
