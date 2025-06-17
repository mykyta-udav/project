package com.restaurantbackendapp.model;

import lombok.Builder;

@Builder
public record Location(String locationId, String address) {
}
