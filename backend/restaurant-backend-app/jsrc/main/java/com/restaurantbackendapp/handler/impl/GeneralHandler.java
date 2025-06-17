package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.restaurantbackendapp.handler.EndpointHandler;
import java.util.Map;

public class GeneralHandler implements EndpointHandler {
    private final EndpointHandler notFoundHandler;
    private final Map<String, EndpointHandler> handlerMap;

    public GeneralHandler(EndpointHandler notFoundHandler, Map<String, EndpointHandler> handlerMap) {
        this.notFoundHandler = notFoundHandler;
        this.handlerMap = handlerMap;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {
        String routeKey = requestEvent.getHttpMethod() + ":" + requestEvent.getPath();

        return handlerMap.getOrDefault(routeKey, notFoundHandler).handle(requestEvent, context);
    }
}
