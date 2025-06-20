package com.restaurantbackendapp.repository;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.restaurantbackendapp.repository.impl.DishRepositoryImpl;
import com.restaurantbackendapp.repository.impl.FeedbackRepositoryImpl;
import com.restaurantbackendapp.repository.impl.LocationRepositoryImpl;
import com.restaurantbackendapp.repository.impl.ReservationRepositoryImpl;
import com.restaurantbackendapp.repository.impl.WaiterRepositoryImpl;
import dagger.Module;
import dagger.Provides;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;

import javax.inject.Named;
import javax.inject.Singleton;

@Module
public class RepoModule {

    @Singleton
    @Provides
    public ReservationRepository provideReservationRepository(@Named("dynamoDbClient") AmazonDynamoDB dynamoDbClient) {
        return new ReservationRepositoryImpl(dynamoDbClient);
    }

    @Singleton
    @Provides
    public LocationRepository provideLocationRepository(@Named("dynamoDbClient") AmazonDynamoDB dynamoDbClient) {
        return new LocationRepositoryImpl(dynamoDbClient);
    }

    @Singleton
    @Provides
    public DishRepository provideDishRepository(@Named("dynamoDbClient") AmazonDynamoDB dynamoDbClient) {
        return new DishRepositoryImpl(dynamoDbClient);
    }

    @Singleton
    @Provides
    public FeedbackRepository provideFeedbackRepository(@Named("dynamoDbClient") AmazonDynamoDB dynamoDbClient) {
        return new FeedbackRepositoryImpl(dynamoDbClient);
    }

    @Singleton
    @Provides
    public WaiterRepository provideWaiterRepository(@Named("dynamoDbClient") AmazonDynamoDB dynamoDbClient) {
        return new WaiterRepositoryImpl(dynamoDbClient);
    }
}
