package com.evshare.backend.dto;

import com.evshare.backend.entity.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private Vehicle vehicle;
    private KpiDTO kpi;
    private List<Booking> bookings;
    private List<Transaction> transactions;
    private List<User> coOwners;
    private List<Vote> activeVotes;
    private List<Suggestion> suggestions;
    private List<Vehicle> availableVehicles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpiDTO {
        private Double totalCostThisMonth;
        private Double costChangePercentage;
        private Double drivenKmThisMonth;
        private Double kmChangePercentage;
        private Integer bookingCountThisMonth;
        private Double jointFundBalance;
        private String jointFundStatus;
    }
}
