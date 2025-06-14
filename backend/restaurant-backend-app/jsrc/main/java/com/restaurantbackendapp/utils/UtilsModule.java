package com.restaurantbackendapp.utils;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.impl.GetTablesHandler;
import dagger.Module;
import dagger.Provides;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Named;
import javax.inject.Singleton;
import java.util.Map;

@Module
public class UtilsModule {
    private static final Logger LOGGER = LoggerFactory.getLogger(UtilsModule.class);

    @Singleton
    @Provides
    public Gson provideGson() {
        return new Gson();
    }

    @Singleton
    @Provides
    @Named("cors")
    public Map<String, String> provideCorsHeaders() {
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
    public AmazonDynamoDB provideDynamoDBClient() {
        LOGGER.info("Initializing DynamoDB client");
        LOGGER.info("Using region: ap-south-1");

        return AmazonDynamoDBClientBuilder.standard()
                .withRegion("ap-south-1")
                .withClientConfiguration(new ClientConfiguration()
                        .withConnectionTimeout(2000)
                        .withRequestTimeout(5000))
                .build();
    }
}
