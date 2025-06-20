package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.QueryRequest;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.restaurantbackendapp.repository.DishRepository;
import javax.inject.Named;
import java.util.Map;

public class DishRepositoryImpl implements DishRepository {
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String DISHES_TABLE = "DISHES_TABLE";
    private final AmazonDynamoDB dynamoDbClient;

    public DishRepositoryImpl(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    @Override
    public QueryResult findPopularDishes() {
        QueryRequest queryRequest = new QueryRequest()
                .withTableName(System.getenv(DISHES_TABLE))
                .withIndexName("PopularDishesIndex")
                .withKeyConditionExpression("isPopular = :isPopular")
                .withExpressionAttributeValues(
                        Map.of(":isPopular", new AttributeValue().withS("true")));

        return dynamoDbClient.query(queryRequest);
    }
}
