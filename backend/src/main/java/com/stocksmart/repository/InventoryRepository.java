package com.stocksmart.repository;
import com.stocksmart.entity.Inventory;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductIdAndLocationId(Long productId, Long locationId);
    List<Inventory> findByLocationId(Long locationId);
    List<Inventory> findByProductId(Long productId);

    @Query("SELECT COALESCE(SUM(i.quantityOnHand), 0) FROM Inventory i")
    long sumTotalQuantity();

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p JOIN FETCH i.location l " +
           "WHERE l.id = :locationId ORDER BY p.name")
    Page<Inventory> findByLocationIdWithDetails(@Param("locationId") Long locationId, Pageable pageable);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.location.id = :locationId")
    Optional<Inventory> findByProductIdAndLocationIdForUpdate(@Param("productId") Long productId,
                                                               @Param("locationId") Long locationId);
}
