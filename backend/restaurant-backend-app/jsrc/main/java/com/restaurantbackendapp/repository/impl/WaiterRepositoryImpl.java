package com.restaurantbackendapp.repository.impl;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.GetItemRequest;
import com.amazonaws.services.dynamodbv2.model.GetItemResult;
import com.restaurantbackendapp.repository.WaiterRepository;
import software.amazon.awssdk.core.exception.SdkClientException;


import javax.inject.Named;
import java.util.HashMap;
import java.util.Map;

public class WaiterRepositoryImpl implements WaiterRepository {
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String TABLE_NAME = System.getenv("WAITERS_TABLE");
    private final AmazonDynamoDB dynamoDbClient;


    public WaiterRepositoryImpl(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    @Override
    public boolean existsByEmail(String email) {
        try {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("email", new AttributeValue().withS(email));

            GetItemRequest getItemRequest = new GetItemRequest()
                    .withTableName(TABLE_NAME)
                    .withKey(key);

            GetItemResult itemResult = dynamoDbClient.getItem(getItemRequest);

            return itemResult.getItem() != null && !itemResult.getItem().isEmpty();
        } catch (AmazonServiceException ase) {
            throw new RuntimeException("DynamoDB access error: " + ase.getMessage(), ase);
        } catch (SdkClientException sce) {
            throw new RuntimeException("Client-side error: " + sce.getMessage(), sce);
        }
    }
}
