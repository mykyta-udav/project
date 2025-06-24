package com.restaurantbackendapp.dto.request;

public record TableRequestQueryParams(
    String locationId,
    String date,
    String time,
    String guests
) {}