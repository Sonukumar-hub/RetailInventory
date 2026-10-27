package com.stocksmart.repository;
import com.stocksmart.entity.InventoryMovement;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    Page<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
    Page<InventoryMovement> findByLocationIdOrderByCreatedAtDesc(Long locationId, Pageable pageable);

    @Query("SELECT im FROM InventoryMovement im WHERE im.createdAt >= :from ORDER BY im.createdAt DESC")
    List<InventoryMovement> findRecentMovements(@Param("from") LocalDateTime from, Pageable pageable);
}
