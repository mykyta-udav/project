package com.restaurantbackendapp.repository;

import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.restaurantbackendapp.model.Dish;

import java.util.List;

public interface DishRepository {
    QueryResult findPopularDishes();
    List<Dish> findAllDishesByDishIds(List<String> dishIds);
}
