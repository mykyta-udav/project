package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.QueryRequest;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.restaurantbackendapp.model.Dish;
import com.restaurantbackendapp.repository.DishRepository;
import javax.inject.Named;
import java.util.List;
import java.util.Map;

public class DishRepositoryImpl implements DishRepository {
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String DISHES_TABLE = "DISHES_TABLE";
    private final AmazonDynamoDB dynamoDbClient;
    private final DynamoDBMapper dynamoDBMapper;

    public DishRepositoryImpl(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.dynamoDBMapper = new DynamoDBMapper(
                dynamoDbClient,
                DynamoDBMapperConfig.builder()
                        .withTableNameOverride(DynamoDBMapperConfig.TableNameOverride.withTableNameReplacement(
                                System.getenv(DISHES_TABLE)))
                        .withConsistentReads(DynamoDBMapperConfig.ConsistentReads.EVENTUAL)
                        .build());
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

    @Override
    public List<Dish> findAllDishesByDishIds(List<String> dishIds) {
        List<Dish> listToFetch = dishIds.stream()
                .map(id -> Dish.builder()
                        .dishId(id)
                        .build())
                .toList();
        Map<String, List<Object>> mapperResp = dynamoDBMapper.batchLoad(listToFetch);

        return mapperResp.values().stream()
                .flatMap(List::stream)
                .filter(Dish.class::isInstance)
                .map(Dish.class::cast)
                .toList();
    }
}
