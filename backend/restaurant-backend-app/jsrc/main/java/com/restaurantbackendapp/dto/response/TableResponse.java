package com.restaurantbackendapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@EqualsAndHashCode
public class TableResponse {
    private String locationId;
    private String locationAddress;
    private Integer tableNumber;
    private Integer capacity;
    private List<String> availableSlots = new ArrayList<>();

    public void addTimeSlot(String timeSlot) {
        if (timeSlot != null) {
            availableSlots.add(timeSlot);
        }
    }
}
