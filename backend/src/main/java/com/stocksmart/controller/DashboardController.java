package com.stocksmart.controller;

import com.stocksmart.dto.dashboard.DashboardKpiResponse;
import com.stocksmart.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    @Operation(summary = "Get dashboard KPI metrics")
    public ResponseEntity<DashboardKpiResponse> getKpis() {
        return ResponseEntity.ok(dashboardService.getKpis());
    }
}
