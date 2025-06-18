package com.restaurantbackendapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDto {
    private String reservationId;
    private String status;
    private String locationAddress;
    private String date;
    private String timeSlot;
    private String assignedWaiterId;
    private String guestsNumber;
}
