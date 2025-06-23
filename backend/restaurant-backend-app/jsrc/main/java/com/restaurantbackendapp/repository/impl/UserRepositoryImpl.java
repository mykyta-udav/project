package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.GetItemRequest;
import com.amazonaws.services.dynamodbv2.model.GetItemResult;
import com.amazonaws.services.dynamodbv2.model.PutItemRequest;
import com.restaurantbackendapp.model.User;
import com.restaurantbackendapp.repository.UserRepository;

import javax.inject.Named;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class UserRepositoryImpl implements UserRepository {
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String TABLE_NAME = System.getenv("USERS_TABLE");
    private final AmazonDynamoDB dynamoDbClient;

    public UserRepositoryImpl(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    @Override
    public void save(User user) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("cognitoId", new AttributeValue().withS(user.getCognitoId()));
        item.put("email", new AttributeValue().withS(user.getEmail()));
        item.put("firstName", new AttributeValue().withS(user.getFirstName()));
        item.put("lastName", new AttributeValue().withS(user.getLastName()));


        if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
            item.put("profileImageUrl", new AttributeValue().withS(user.getProfileImageUrl()));
        }

        PutItemRequest request = new PutItemRequest()
                .withTableName(TABLE_NAME)
                .withItem(item);

        dynamoDbClient.putItem(request);
    }

    @Override
    public Optional<User> findById(String cognitoId) {
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("cognitoId", new AttributeValue().withS(cognitoId));

        GetItemRequest request = new GetItemRequest()
                .withTableName(TABLE_NAME)
                .withKey(key);

        GetItemResult result = dynamoDbClient.getItem(request);
        Map<String, AttributeValue> item = result.getItem();

        if (item == null || item.isEmpty()) {
            return Optional.empty();
        }

        User user = new User(
                item.get("cognitoId").getS(),
                item.get("email").getS(),
                item.get("firstName").getS(),
                item.get("lastName").getS(),
                item.containsKey("profileImageUrl") ? item.get("profileImageUrl").getS() : ""
        );

        return Optional.of(user);

    }
}


