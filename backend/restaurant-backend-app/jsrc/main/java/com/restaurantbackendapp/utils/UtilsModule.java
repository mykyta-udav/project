package com.restaurantbackendapp.utils;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.google.gson.Gson;
import dagger.Module;
import dagger.Provides;

import javax.inject.Named;
import javax.inject.Singleton;
import java.util.Map;

@Module
public class UtilsModule {

    @Singleton
    @Provides
    Gson provideGson() {
        return new Gson();
    }

    @Singleton
    @Provides
    @Named("cors")
    Map<String, String> provideCorsHeaders() {
        return Map.of(
                "Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Origin", "*",
                "Access-Control-Allow-Methods", "*",
                "Accept-Version", "*"
        );
    }

    @Singleton
    @Provides
    @Named("dynamoDbClient")
    public AmazonDynamoDB initializeDynamoDBClient(String region) {
        return AmazonDynamoDBClientBuilder.standard()
                .withRegion(System.getenv(region))
                .withClientConfiguration(new ClientConfiguration()
                        .withConnectionTimeout(2000)
                        .withRequestTimeout(5000))
                .build();
    }
}
