package com.restaurantbackendapp.model;

import java.util.ArrayList;
import java.util.List;

public class Table {
    private String locationId;
    private String locationAddress;
    private String tableNumber;
    private String capacity;
    private List<String> availableSlots = new ArrayList<>();

    public Table() {}

    public Table(String locationId, String locationAddress, String tableNumber, String capacity, List<String> availableSlots) {
        this.locationId = locationId;
        this.locationAddress = locationAddress;
        this.tableNumber = tableNumber;
        this.capacity = capacity;
        this.availableSlots = availableSlots;
    }

    public void addTimeSlot(String timeSlot) {
        if (timeSlot != null) {
            availableSlots.add(timeSlot);
        }
    }

    @Override
    public String toString() {
        return "Table{" +
                "locationId='" + locationId + '\'' +
                ", locationAddress='" + locationAddress + '\'' +
                ", tableNumber='" + tableNumber + '\'' +
                ", capacity='" + capacity + '\'' +
                ", availableSlots=" + availableSlots +
                '}';
    }

    public String getLocationId() {
        return locationId;
    }

    public void setLocationId(String locationId) {
        this.locationId = locationId;
    }

    public String getLocationAddress() {
        return locationAddress;
    }

    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getCapacity() {
        return capacity;
    }

    public void setCapacity(String capacity) {
        this.capacity = capacity;
    }
}
