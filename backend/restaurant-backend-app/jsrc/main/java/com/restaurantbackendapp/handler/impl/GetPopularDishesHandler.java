package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.Dish;
import com.restaurantbackendapp.repository.DishRepository;
import javax.inject.Inject;
import java.util.List;

public class GetPopularDishesHandler implements EndpointHandler {
    public static final String ERROR = "Error: ";
    private final DishRepository repository;
    private final Gson gson;

    @Inject
    public GetPopularDishesHandler(DishRepository repo, Gson gson) {
        this.repository = repo;
        this.gson = gson;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {
        try {
            QueryResult popularDishes = repository.findPopularDishes();
            List<Dish> popularDishesList = popularDishes.getItems().stream()
                    .map(item -> Dish.builder()
                            .name(item.get("name").getS())
                            .price(Double.parseDouble(item.get("price").getN()))
                            .weight(item.get("weight").getS())
                            .imageUrl(item.get("imageUrl").getS())
                            .build()
                    )
                    .toList();

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(popularDishesList));
        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(e.getMessage());
        }
    }
}
