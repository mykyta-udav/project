package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.EndpointHandler;

import java.util.Map;

public class NotFoundHandler implements EndpointHandler {
    private final Gson gson;

    public NotFoundHandler(Gson gson) {
        this.gson = gson;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayV2HTTPEvent requestEvent, Context context) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(404)
                .withBody(gson.toJson(Map.of("message", "Not Found")));
    }
}
