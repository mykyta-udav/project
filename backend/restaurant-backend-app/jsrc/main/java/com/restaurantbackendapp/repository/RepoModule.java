package com.restaurantbackendapp.repository;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.google.gson.Gson;
import com.restaurantbackendapp.repository.impl.ReservationRepositoryImpl;
import dagger.Module;
import dagger.Provides;
import javax.inject.Named;
import javax.inject.Singleton;

@Module
public class RepoModule {

    @Singleton
    @Provides
    public ReservationRepository provideReservationRepository(@Named("dynamoDbClient") AmazonDynamoDB dynamoDbClient) {
        return new ReservationRepositoryImpl(dynamoDbClient);
    }
}
