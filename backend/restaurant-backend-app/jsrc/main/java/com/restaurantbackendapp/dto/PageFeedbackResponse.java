package com.restaurantbackendapp.dto;

import com.restaurantbackendapp.model.Feedback;
import lombok.Builder;
import java.util.List;

@Builder
public record PageFeedbackResponse(
        int totalPages,
        int totalElements,
        int size,
        List<Feedback> content,
        int number,
        List<SortObject> sort,
        boolean first,
        boolean last,
        int numberOfElements,
        PageableObject pageable,
        boolean empty
) { }
