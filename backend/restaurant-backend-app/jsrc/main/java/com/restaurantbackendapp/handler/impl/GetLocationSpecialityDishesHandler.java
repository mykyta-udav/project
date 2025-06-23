package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.exception.LocationNotFoundException;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.Dish;
import com.restaurantbackendapp.model.Location;
import com.restaurantbackendapp.repository.DishRepository;
import com.restaurantbackendapp.repository.LocationRepository;
import software.amazon.awssdk.annotations.NotNull;
import javax.inject.Inject;
import java.util.List;
import java.util.Map;

public class GetLocationSpecialityDishesHandler implements EndpointHandler {
    public static final String ERROR = "Error: ";
    public static final String INTERNAL_SERVER_ERROR = "Internal Server Error";
    public static final String NO_LOCATIONS_FOUND = "No Locations Found";
    private final LocationRepository locationRepository;
    public static final String MESSAGE = "Message";
    private final DishRepository dishRepository;
    private final Gson gson;

    @Inject
    public GetLocationSpecialityDishesHandler(LocationRepository locationRepository, Gson gson, DishRepository dishRepository) {
        this.locationRepository = locationRepository;
        this.dishRepository = dishRepository;
        this.gson = gson;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(@NotNull APIGatewayProxyRequestEvent requestEvent, @NotNull Context context) {
        try {
            String id = requestEvent.getPathParameters().get("id");
            context.getLogger().log(String.format("Speciality dishes for location id %s", id));
            List<Location> locationList = locationRepository.findSpecialityDishesByLocationId(id);

            if (locationList.isEmpty()) {
                throw new LocationNotFoundException(String.format("Location with ID '%s' not found.", id));
            }

            List<String> specialityDishIds = locationList.stream()
                    .findFirst()
                    .map(Location::getSpecialityDishIds)
                    .orElse(List.of());

            List<Dish> specialityDishes = dishRepository.findAllDishesByDishIds(specialityDishIds).stream()
                    .map(dish -> Dish.builder()
                            .name(dish.getName())
                            .price(dish.getPrice())
                            .weight(dish.getWeight())
                            .imageUrl(dish.getImageUrl())
                            .build())
                    .toList();

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(specialityDishes));

        } catch (LocationNotFoundException e) {
            context.getLogger().log(ERROR + e.getMessage());
            return response(404, NO_LOCATIONS_FOUND, e);
        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            return response(500, INTERNAL_SERVER_ERROR, e);
        }
    }

    private APIGatewayProxyResponseEvent response(int statusCode, String message, Throwable e) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withBody(gson.toJson(Map.of(
                        ERROR, message,
                        MESSAGE, e.getMessage())));
    }
}
