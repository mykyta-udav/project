package com.restaurantbackendapp.handler;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.impl.GeneralHandler;
import com.restaurantbackendapp.handler.impl.GetTablesHandler;
import com.restaurantbackendapp.handler.impl.NotFoundHandler;
import com.restaurantbackendapp.handler.impl.SignUpHandler;
import com.restaurantbackendapp.repository.ReservationRepository;
import dagger.Module;
import dagger.Provides;
import dagger.multibindings.IntoMap;
import dagger.multibindings.StringKey;

import javax.inject.Named;
import javax.inject.Singleton;
import java.util.Map;

@Module
public class HandlersModule {

    @Singleton
    @Provides
    @Named("general")
    public EndpointHandler provideGeneralHandler(
            @Named("notFound") EndpointHandler notFoundHandler,
            Map<String, EndpointHandler> handlerMap) {
        return new GeneralHandler(notFoundHandler, handlerMap);
    }

    @Singleton
    @Provides
    @Named("notFound")
    public EndpointHandler provideNotFoundHandler(Gson gson) {
        return new NotFoundHandler(gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/bookings/tables")
    public EndpointHandler provideGetTablesHandler(ReservationRepository repo, Gson gson) {
        return new GetTablesHandler(repo, gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("POST:/auth/sign-up")
    public EndpointHandler provideSignUpHandler(SignUpHandler handler) {
        return handler;
    }
}
