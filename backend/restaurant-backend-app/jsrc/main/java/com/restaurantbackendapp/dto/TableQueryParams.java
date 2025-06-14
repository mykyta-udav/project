package com.restaurantbackendapp.dto;

//@ToString
//@Getter
//@AllArgsConstructor
//@Builder
public class TableQueryParams {
    private final String locationId;
    private final String date;
    private final String timeSlot;
    private final String guests;

    public TableQueryParams(String locationId, String date, String timeSlot, String guests) {
        this.locationId = locationId;
        this.date = date;
        this.timeSlot = timeSlot;
        this.guests = guests;
    }

    public String getLocationId() {
        return locationId;
    }

    public String getDate() {
        return date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public String getGuests() {
        return guests;
    }

    @Override
    public String toString() {
        return "TableQueryParams{" +
                "locationId='" + locationId + '\'' +
                ", date='" + date + '\'' +
                ", timeSlot='" + timeSlot + '\'' +
                ", guests='" + guests + '\'' +
                '}';
    }
}