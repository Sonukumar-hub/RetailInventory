package com.stocksmart.repository;
import com.stocksmart.entity.Location;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LocationRepository extends JpaRepository<Location, Long> {
    boolean existsByName(String name);
    Page<Location> findByActiveTrue(Pageable pageable);
    java.util.List<Location> findByActiveTrue();
    long countByActiveTrue();
}
