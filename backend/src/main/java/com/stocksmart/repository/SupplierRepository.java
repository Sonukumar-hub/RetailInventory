package com.stocksmart.repository;
import com.stocksmart.entity.Supplier;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    long countByActiveTrue();
    @Query("SELECT s FROM Supplier s WHERE s.active = true AND " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(s.email) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Supplier> searchSuppliers(@Param("search") String search, Pageable pageable);
}
