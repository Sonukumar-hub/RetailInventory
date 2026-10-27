package com.stocksmart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stocksmart.config.SecurityConfig;
import com.stocksmart.dto.product.*;
import com.stocksmart.repository.UserRepository;
import com.stocksmart.security.*;
import com.stocksmart.service.ProductService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class})
class ProductControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean ProductService productService;
    @MockBean CustomUserDetailsService userDetailsService;
    @MockBean UserRepository userRepository;

    private ProductResponse sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new ProductResponse(1L, "SKU-001", "Test Product", "Desc",
                1L, "Electronics", "BARCODE-001", "UNIT",
                new BigDecimal("100.00"), new BigDecimal("150.00"),
                5, true, LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    @DisplayName("GET /products - returns product page")
    void getProducts_returnsPage() throws Exception {
        Page<ProductResponse> page = new PageImpl<>(List.of(sampleProduct));
        when(productService.searchProducts(any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("SKU-001"));
    }

    @Test
    @WithMockUser(roles = "INVENTORY_MANAGER")
    @DisplayName("POST /products - creates product")
    void createProduct_success() throws Exception {
        ProductRequest req = new ProductRequest("SKU-001", "Test Product", "Desc",
                null, null, "UNIT",
                new BigDecimal("100.00"), new BigDecimal("150.00"), 5);

        when(productService.create(any())).thenReturn(sampleProduct);

        mockMvc.perform(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("SKU-001"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    @DisplayName("POST /products - STAFF is forbidden")
    void createProduct_staffForbidden() throws Exception {
        ProductRequest req = new ProductRequest("SKU-001", "Test", null, null, null, "UNIT",
                BigDecimal.TEN, BigDecimal.TEN, 0);

        mockMvc.perform(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }
}
