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
import java.util.List;

public class GetLocationSpecialityDishesHandler implements EndpointHandler {
    public static final String LOCATION_ID = "locationId";
    public static final String ERROR = "Error: ";
    public static final String SPECIALITY_DISH_IDS = "specialityDishIds";
    private final LocationRepository repository;
    private final Gson gson;

    @Inject
    public GetLocationSpecialityDishesHandler(LocationRepository repository, Gson gson) {
        this.repository = repository;
        this.gson = gson;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(@NotNull APIGatewayProxyRequestEvent requestEvent, @NotNull Context context) {
        try {
            context.getLogger().log(String.format("Speciality dishes for location id %s", requestEvent.getPathParameters().get("id")));
            List<Location> locationList = repository.findSpecialityDishesByLocationId(requestEvent.getPathParameters().get("id"));

            List<String> specialityDishIds = locationList.stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Location not found"))
                    .getSpecialityDishIds();

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(specialityDishIds));
        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(e.getMessage());
        }
    }
}
