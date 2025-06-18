package com.restaurantbackendapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequestDto {

    private String locationId;
    private String tableNumber;
    private Integer guestsNumber;
    private String date;
    private String timeFrom;
    private String timeTo;

}
