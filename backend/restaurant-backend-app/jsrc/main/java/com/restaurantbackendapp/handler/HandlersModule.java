package com.restaurantbackendapp.handler;

import com.google.gson.Gson;
import com.restaurantbackendapp.handler.impl.*;
import com.restaurantbackendapp.repository.LocationRepository;
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
    @StringKey("POST:/auth/sign-in")
    public EndpointHandler provideSignInHandler(SignInHandler handler) {
        return handler;
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/bookings/tables")
    public EndpointHandler provideGetTablesHandler(ReservationRepository repo, Gson gson) {
        return new GetAvailableTablesHandler(repo, gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/locations/select-options")
    public EndpointHandler provideGetLocationAddressesListHandler(LocationRepository repo, Gson gson) {
        return new GetLocationAddressesListHandler(repo, gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("POST:/auth/sign-up")
    public EndpointHandler provideSignUpHandler(SignUpHandler handler) {
        return handler;
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/users/profile")
    public EndpointHandler provideGetUserProfileHandler(GetUserProfileHandler handler){
        return handler;
    }
}
