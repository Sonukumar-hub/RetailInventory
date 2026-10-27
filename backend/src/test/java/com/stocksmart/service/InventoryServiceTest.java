package com.stocksmart.service;

import com.stocksmart.dto.inventory.*;
import com.stocksmart.entity.*;
import com.stocksmart.exception.*;
import com.stocksmart.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.*;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InventoryServiceTest {

    @Mock InventoryRepository inventoryRepository;
    @Mock InventoryMovementRepository movementRepository;
    @Mock ProductRepository productRepository;
    @Mock LocationRepository locationRepository;
    @Mock UserRepository userRepository;
    @InjectMocks InventoryService inventoryService;

    private Product testProduct;
    private Location testLocation;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder().id(1L).sku("SKU-001").name("Product").build();
        testLocation = Location.builder().id(1L).name("Warehouse").build();

        // Mock security context
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("testuser");
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Receive stock - creates new inventory record")
    void receiveStock_newInventory_success() {
        StockReceiveRequest req = new StockReceiveRequest(1L, 1L, 50, "Initial stock");

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));
        when(inventoryRepository.findByProductIdAndLocationIdForUpdate(1L, 1L)).thenReturn(Optional.empty());

        Inventory savedInv = Inventory.builder().id(1L).product(testProduct).location(testLocation)
                .quantityOnHand(50).quantityReserved(0).build();
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(savedInv);
        when(movementRepository.save(any())).thenReturn(null);

        InventoryResponse response = inventoryService.receiveStock(req);

        assertThat(response.quantityOnHand()).isEqualTo(50);
        verify(inventoryRepository).save(any(Inventory.class));
        verify(movementRepository).save(any());
    }

    @Test
    @DisplayName("Adjust stock - negative adjustment below zero throws exception")
    void adjustStock_negativeBelow0_throws() {
        StockAdjustmentRequest req = new StockAdjustmentRequest(1L, 1L, -100, "Adjustment");

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));

        Inventory inv = Inventory.builder().id(1L).product(testProduct).location(testLocation)
                .quantityOnHand(50).quantityReserved(0).build();
        when(inventoryRepository.findByProductIdAndLocationIdForUpdate(1L, 1L)).thenReturn(Optional.of(inv));

        assertThatThrownBy(() -> inventoryService.adjustStock(req))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    @DisplayName("Transfer - same source and destination throws exception")
    void transfer_sameLocations_throws() {
        StockTransferRequest req = new StockTransferRequest(1L, 1L, 1L, 10, "Transfer");
        assertThatThrownBy(() -> inventoryService.transferStock(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("different");
    }

    @Test
    @DisplayName("Transfer - insufficient stock throws exception")
    void transfer_insufficientStock_throws() {
        StockTransferRequest req = new StockTransferRequest(1L, 1L, 2L, 100, "Transfer");

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));
        Location dest = Location.builder().id(2L).name("Store").build();
        when(locationRepository.findById(2L)).thenReturn(Optional.of(dest));

        Inventory srcInv = Inventory.builder().id(1L).product(testProduct).location(testLocation)
                .quantityOnHand(20).quantityReserved(0).build();
        when(inventoryRepository.findByProductIdAndLocationIdForUpdate(1L, 1L)).thenReturn(Optional.of(srcInv));

        assertThatThrownBy(() -> inventoryService.transferStock(req))
                .isInstanceOf(InsufficientStockException.class);
    }
}
