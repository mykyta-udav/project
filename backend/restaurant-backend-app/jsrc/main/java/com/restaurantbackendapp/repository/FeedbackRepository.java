package com.restaurantbackendapp.repository;

import com.restaurantbackendapp.dto.response.PageFeedbackResponse;

public interface FeedbackRepository {
    PageFeedbackResponse getFeedbacks(String locationId, String type, int page, int size, String sortProperty, String sortDirection);
}
