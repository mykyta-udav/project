package com.restaurantbackendapp.handler;

import com.google.gson.Gson;
import com.restaurantbackendapp.handler.impl.GeneralHandler;
import com.restaurantbackendapp.handler.impl.NotFoundHandler;
import com.restaurantbackendapp.handler.impl.SignInHandler;
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

    // Handler for 404 Not Found responses
    @Singleton
    @Provides
    @Named("notFound")
    public EndpointHandler provideNotFoundHandler(Gson gson) {
        return new NotFoundHandler(gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("POST:/sign-in")
    public EndpointHandler provideSignInHandler(SignInHandler handler) {
        return handler;
    }
}
