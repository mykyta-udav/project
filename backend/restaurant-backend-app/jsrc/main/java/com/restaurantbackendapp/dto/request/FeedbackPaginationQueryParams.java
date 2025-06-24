package com.restaurantbackendapp.dto.request;

public record FeedbackPaginationQueryParams(
        String type,
        Integer page,
        Integer size,
        String sortProperty,
        String sortDirection
) {
}
