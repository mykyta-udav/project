package com.restaurantbackendapp;

import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.handler.HandlersModule;
import com.restaurantbackendapp.utils.UtilsModule;
import dagger.Component;

import javax.inject.Named;
import javax.inject.Singleton;
import java.util.Map;

@Singleton
@Component(modules = {HandlersModule.class, UtilsModule.class})
public interface Application {

    @Named("cors")
    Map<String, String> getCorsHeaders();

    @Named("general")
    EndpointHandler getGeneralApiHandler();
}