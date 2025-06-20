package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.Location;
import com.restaurantbackendapp.repository.LocationRepository;
import software.amazon.awssdk.annotations.NotNull;
import javax.inject.Inject;
import java.util.Collections;
import java.util.List;

public class GetMainPageLocationsHandler implements EndpointHandler {
    public static final String ERROR = "Error: ";
    private final LocationRepository repository;
    private final Gson gson;

    @Inject
    public GetMainPageLocationsHandler(LocationRepository repo, Gson gson) {
        this.repository = repo;
        this.gson = gson;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(@NotNull APIGatewayProxyRequestEvent requestEvent, @NotNull Context context) {
        try {
            List<Location> locationList = repository.findAllLocationAddresses();

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(locationList));
        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(e.getMessage());
        }
    }
}
