package com.restaurantbackendapp.dto.response;

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
