package com.stocksmart.repository;
import com.stocksmart.entity.Product;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
    boolean existsByBarcode(String barcode);
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    boolean existsBySkuAndIdNot(String sku, Long id);
    boolean existsByBarcodeAndIdNot(String barcode, Long id);
    long countByActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%',:search,'%')))" +
           " AND (:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Product> searchProducts(@Param("search") String search,
                                  @Param("categoryId") Long categoryId,
                                  Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p JOIN Inventory i ON i.product.id = p.id " +
           "WHERE i.quantityOnHand <= p.reorderLevel AND p.active = true")
    java.util.List<Product> findLowStockProducts();

    @Query("SELECT COUNT(DISTINCT p) FROM Product p JOIN Inventory i ON i.product.id = p.id " +
           "WHERE i.quantityOnHand = 0 AND p.active = true")
    long countOutOfStockProducts();

    @Query("SELECT COUNT(DISTINCT p) FROM Product p JOIN Inventory i ON i.product.id = p.id " +
           "WHERE i.quantityOnHand <= p.reorderLevel AND i.quantityOnHand > 0 AND p.active = true")
    long countLowStockProducts();
}
