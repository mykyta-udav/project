package com.restaurantbackendapp.utils;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.impl.CognitoGroupInitializer;
import dagger.Module;
import dagger.Provides;
import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;

import javax.inject.Named;
import javax.inject.Singleton;
import java.util.Map;

@Module
public class UtilsModule {

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
        return AmazonDynamoDBClientBuilder.standard()
                .withRegion(System.getenv("REGION"))
                .withClientConfiguration(new ClientConfiguration()
                        .withConnectionTimeout(2000)
                        .withRequestTimeout(5000))
                .build();
    }

    @Singleton
    @Provides
    @Named("cognitoClient")
    public CognitoIdentityProviderClient initializeCognitoClient() {
        return CognitoIdentityProviderClient.builder()
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
                .region(Region.of(System.getenv("REGION")))
                .build();
    }

    @Provides
    @Singleton
    @Named("userPoolId")
    String provideUserPoolId() {
        return System.getenv("COGNITO_ID");
    }

    @Provides
    @Singleton
    @Named("userPoolClientId")
    String provideUserPoolClientId() {
        return System.getenv("CLIENT_ID");
    }

    @Provides
    @Singleton
    @Named("cognitoUserGroup")
    public CognitoGroupInitializer provideCognitoGroupInitializer(
            @Named("cognitoClient") CognitoIdentityProviderClient client,
            @Named("userPoolId") String userPoolId) {
        return new CognitoGroupInitializer(client, userPoolId);
    }
}
