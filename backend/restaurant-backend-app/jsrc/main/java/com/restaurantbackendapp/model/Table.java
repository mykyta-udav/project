package com.restaurantbackendapp.model;

import lombok.AllArgsConstructor;
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
@EqualsAndHashCode
public class Table {
    private String locationId;
    private String locationAddress;
    private String tableNumber;
    private String capacity;
    private List<String> availableSlots = new ArrayList<>();

    public void addTimeSlot(String timeSlot) {
        if (timeSlot != null) {
            availableSlots.add(timeSlot);
        }
    }
}
