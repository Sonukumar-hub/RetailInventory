package com.stocksmart;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class StockSmartApplicationTest {
    @Test
    void contextLoads() {
        // Verifies application context starts successfully
    }
}
