package com.restaurantbackendapp.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record PageableObject(
        int offset,                 // Offset for the first item in the page
        List<SortObject> sort,      // Sorting criteria
        boolean paged,              // Is pagination applied?
        int pageSize,               // Number of items per page
        int pageNumber,             // Current page number
        boolean unpaged             // Is pagination disabled?
) {
}
