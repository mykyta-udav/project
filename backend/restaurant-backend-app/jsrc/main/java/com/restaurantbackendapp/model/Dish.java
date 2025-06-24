package com.restaurantbackendapp.model;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@DynamoDBTable(tableName = "dummy")
@Builder
@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Dish {
    @DynamoDBHashKey
    private String dishId;

    @DynamoDBAttribute
    private String name;

    @DynamoDBAttribute
    private Double price;

    @DynamoDBAttribute
    private String weight;

    @DynamoDBAttribute
    private String imageUrl;

    @DynamoDBAttribute
    private String calories;

    @DynamoDBAttribute
    private String carbohydrates;

    @DynamoDBAttribute
    private String description;

    @DynamoDBAttribute
    private String dishType; // APPETIZER, MAIN_COURSE, DESSERT

    @DynamoDBAttribute
    private String fats;

    @DynamoDBAttribute
    private String proteins;

    @DynamoDBAttribute
    private String state;

    @DynamoDBAttribute
    private String vitamins;

}