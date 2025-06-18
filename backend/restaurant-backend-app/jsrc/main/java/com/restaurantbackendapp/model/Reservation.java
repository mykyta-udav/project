package com.restaurantbackendapp.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
    private String reservationId;
    private String customerId;
    private String locationId;
    private String tableNumber;
    private String date;
    private String time;
    private Integer guests;
    private String status;
    private String assignedWaiterId;
}
