package com.stocksmart.repository;
import com.stocksmart.entity.Category;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
    Page<Category> findByActiveTrue(Pageable pageable);
    Optional<Category> findByName(String name);
}
