package com.restaurantbackendapp.model;

import lombok.Builder;

@Builder
public record Dish(
    String name,
    Double price,
    String weight,
    String imageUrl,
    String calories,
    String carbohydrates,
    String description,
    String dishType,
    String fats,
    String id,
    String proteins,
    String state,
    String vitamins
) {
}