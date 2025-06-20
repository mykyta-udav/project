package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.QueryRequest;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.restaurantbackendapp.model.Location;
import com.restaurantbackendapp.repository.LocationRepository;
import javax.inject.Named;
import java.util.List;
import java.util.Map;

public class LocationRepositoryImpl implements LocationRepository {
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String LOCATIONS_TABLE = "LOCATIONS_TABLE";
    private final AmazonDynamoDB dynamoDbClient;
    private final DynamoDBMapper dynamoDBMapper;

    public LocationRepositoryImpl(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.dynamoDBMapper = new DynamoDBMapper(
                dynamoDbClient,
                DynamoDBMapperConfig.builder()
                .withTableNameOverride(DynamoDBMapperConfig.TableNameOverride.withTableNameReplacement(
                        System.getenv(LOCATIONS_TABLE)))
                .build());
    }

    @Override
    public List<Location> findAllLocationAddresses() {
        return dynamoDBMapper.scan(Location.class, new DynamoDBScanExpression());
    }

    @Override
    public List<Location> findSpecialityDishesByLocationId(String locationId) {
        DynamoDBQueryExpression<Location> queryExpression = new DynamoDBQueryExpression<Location>()
                .withHashKeyValues(Location.builder().locationId(locationId).build());

        return dynamoDBMapper.query(Location.class, queryExpression);
    }
}
