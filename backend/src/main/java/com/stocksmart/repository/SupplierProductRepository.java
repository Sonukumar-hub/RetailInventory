package com.stocksmart.repository;
import com.stocksmart.entity.SupplierProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface SupplierProductRepository extends JpaRepository<SupplierProduct, Long> {
    List<SupplierProduct> findBySupplierId(Long supplierId);
    List<SupplierProduct> findByProductId(Long productId);
    Optional<SupplierProduct> findBySupplierIdAndProductId(Long supplierId, Long productId);
    boolean existsBySupplierIdAndProductId(Long supplierId, Long productId);
}
