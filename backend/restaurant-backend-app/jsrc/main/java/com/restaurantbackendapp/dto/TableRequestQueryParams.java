package com.restaurantbackendapp.dto;

public record TableRequestQueryParams(
    String locationId,
    String date,
    String time,
    String guests
) {}