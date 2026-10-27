package com.stocksmart.service;

import com.stocksmart.dto.product.*;
import com.stocksmart.entity.*;
import com.stocksmart.exception.*;
import com.stocksmart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String search, Long categoryId, Pageable pageable) {
        return productRepository.searchProducts(search, categoryId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public ProductResponse getBySkuOrBarcode(String value) {
        Optional<Product> product = productRepository.findBySku(value);
        if (product.isEmpty()) product = productRepository.findByBarcode(value);
        return product.map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU/Barcode: " + value));
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        validateUniqueness(req, null);
        Category category = req.categoryId() != null
                ? categoryRepository.findById(req.categoryId()).orElseThrow(() -> new ResourceNotFoundException("Category", req.categoryId()))
                : null;
        Product p = Product.builder()
                .sku(req.sku()).name(req.name()).description(req.description())
                .category(category).barcode(req.barcode())
                .unitOfMeasure(req.unitOfMeasure() != null && !req.unitOfMeasure().isBlank() ? req.unitOfMeasure() : "UNIT")
                .costPrice(req.costPrice() != null ? req.costPrice() : java.math.BigDecimal.ZERO)
                .sellingPrice(req.sellingPrice() != null ? req.sellingPrice() : java.math.BigDecimal.ZERO)
                .reorderLevel(req.reorderLevel() != null ? req.reorderLevel() : 0)
                .active(true)
                .build();
        return toResponse(productRepository.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = findById(id);
        validateUniqueness(req, id);
        Category category = req.categoryId() != null
                ? categoryRepository.findById(req.categoryId()).orElseThrow(() -> new ResourceNotFoundException("Category", req.categoryId()))
                : null;
        p.setSku(req.sku()); p.setName(req.name()); p.setDescription(req.description());
        p.setCategory(category); p.setBarcode(req.barcode());
        p.setUnitOfMeasure(req.unitOfMeasure());
        p.setCostPrice(req.costPrice()); p.setSellingPrice(req.sellingPrice());
        p.setReorderLevel(req.reorderLevel() != null ? req.reorderLevel() : 0);
        return toResponse(productRepository.save(p));
    }

    @Transactional
    public void deactivate(Long id) {
        Product p = findById(id);
        p.setActive(false);
        productRepository.save(p);
    }

    @Transactional(readOnly = true)
    public java.util.List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream().map(this::toResponse).toList();
    }

    private void validateUniqueness(ProductRequest req, Long excludeId) {
        boolean skuExists = excludeId == null
                ? productRepository.existsBySku(req.sku())
                : productRepository.existsBySkuAndIdNot(req.sku(), excludeId);
        if (skuExists) throw new BadRequestException("SKU already exists: " + req.sku());

        if (req.barcode() != null && !req.barcode().isBlank()) {
            boolean barcodeExists = excludeId == null
                    ? productRepository.existsByBarcode(req.barcode())
                    : productRepository.existsByBarcodeAndIdNot(req.barcode(), excludeId);
            if (barcodeExists) throw new BadRequestException("Barcode already exists: " + req.barcode());
        }
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(), p.getSku(), p.getName(), p.getDescription(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getBarcode(), p.getUnitOfMeasure(),
                p.getCostPrice(), p.getSellingPrice(),
                p.getReorderLevel(), p.getActive(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
