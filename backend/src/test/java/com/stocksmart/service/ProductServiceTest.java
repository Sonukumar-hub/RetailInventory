package com.stocksmart.service;

import com.stocksmart.dto.product.*;
import com.stocksmart.entity.*;
import com.stocksmart.exception.*;
import com.stocksmart.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository productRepository;
    @Mock CategoryRepository categoryRepository;
    @InjectMocks ProductService productService;

    @Test
    @DisplayName("Create product - success")
    void createProduct_success() {
        ProductRequest req = new ProductRequest("SKU-001", "Test Product", "Desc",
                null, null, "UNIT",
                new BigDecimal("100.00"), new BigDecimal("150.00"), 5);

        when(productRepository.existsBySku("SKU-001")).thenReturn(false);
        Product saved = Product.builder().id(1L).sku("SKU-001").name("Test Product")
                .costPrice(new BigDecimal("100.00")).sellingPrice(new BigDecimal("150.00"))
                .reorderLevel(5).active(true).build();
        when(productRepository.save(any(Product.class))).thenReturn(saved);

        ProductResponse response = productService.create(req);

        assertThat(response).isNotNull();
        assertThat(response.sku()).isEqualTo("SKU-001");
        assertThat(response.active()).isTrue();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Create product - duplicate SKU throws BadRequestException")
    void createProduct_duplicateSku_throws() {
        ProductRequest req = new ProductRequest("SKU-DUP", "Test", null,
                null, null, "UNIT",
                BigDecimal.TEN, BigDecimal.TEN, 0);
        when(productRepository.existsBySku("SKU-DUP")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("SKU already exists");
    }

    @Test
    @DisplayName("Create product - duplicate barcode throws BadRequestException")
    void createProduct_duplicateBarcode_throws() {
        ProductRequest req = new ProductRequest("SKU-NEW", "Test", null,
                null, "BARCODE-123", "UNIT",
                BigDecimal.TEN, BigDecimal.TEN, 0);
        when(productRepository.existsBySku("SKU-NEW")).thenReturn(false);
        when(productRepository.existsByBarcode("BARCODE-123")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Barcode already exists");
    }

    @Test
    @DisplayName("Get product by ID - not found throws exception")
    void getById_notFound_throws() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Deactivate product sets active=false")
    void deactivateProduct_setsActiveFalse() {
        Product p = Product.builder().id(1L).sku("SKU-001").name("P").active(true)
                .costPrice(BigDecimal.TEN).sellingPrice(BigDecimal.TEN).reorderLevel(0).build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(p));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productService.deactivate(1L);

        assertThat(p.getActive()).isFalse();
        verify(productRepository).save(p);
    }
}
