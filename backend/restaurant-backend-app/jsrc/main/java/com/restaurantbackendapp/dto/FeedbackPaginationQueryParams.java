package com.restaurantbackendapp.dto;

public record FeedbackPaginationQueryParams(
        String type,
        Integer page,
        Integer size,
        String sortProperty,
        String sortDirection
) {
}
