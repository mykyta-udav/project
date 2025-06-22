package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.exception.LocationNotFoundException;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.Location;
import com.restaurantbackendapp.repository.LocationRepository;
import software.amazon.awssdk.annotations.NotNull;
import javax.inject.Inject;
import java.util.List;
import java.util.Map;

public class GetLocationSpecialityDishesHandler implements EndpointHandler {
    public static final String ERROR = "Error: ";
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
            String id = requestEvent.getPathParameters().get("id");
            context.getLogger().log(String.format("Speciality dishes for location id %s", id));
            List<Location> locationList = repository.findSpecialityDishesByLocationId(id);

            if (locationList.isEmpty()) {
                throw new LocationNotFoundException(String.format("Location with ID '%s' not found.", id));
            }

            List<String> specialityDishIds = locationList.stream()
                    .findFirst()
                    .get()
                    .getSpecialityDishIds();

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(specialityDishIds));
        } catch (LocationNotFoundException e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(404)
                    .withBody(gson.toJson(Map.of(
                            "error", "No Locations Found",
                            "message", e.getMessage()))
                    );
        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(gson.toJson(Map.of(
                            "error", "Internal Server Error",
                            "message", e.getMessage()
                    )));
        }
    }
}
