package com.restaurantbackendapp.dto;

import lombok.Builder;

@Builder
public record SortObject(
        String direction,
        String nullHandling,
        boolean ascending,
        String property,
        boolean ignoreCase
) {
}
