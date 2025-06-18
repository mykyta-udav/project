package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.restaurantbackendapp.repository.LocationRepository;
import javax.inject.Named;

public class LocationRepositoryImpl implements LocationRepository {
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String LOCATIONS_TABLE = "LOCATIONS_TABLE";
    private final AmazonDynamoDB dynamoDbClient;

    public LocationRepositoryImpl(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    @Override
    public ScanResult findAllLocationAddresses() {
        ScanRequest scanRequest = new ScanRequest()
                .withTableName(System.getenv(LOCATIONS_TABLE));
        return dynamoDbClient.scan(scanRequest);

    }
}
