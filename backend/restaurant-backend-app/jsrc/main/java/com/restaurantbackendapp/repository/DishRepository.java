package com.restaurantbackendapp.repository;

import com.amazonaws.services.dynamodbv2.model.QueryResult;

public interface DishRepository {
    QueryResult findPopularDishes();
}
