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
        String path = requestEvent.getPath();
        // Convert actual path like "/locations/1/speciality-dishes" to template "/locations/{id}/speciality-dishes"
        String templatePath = path.replaceAll("/locations/\\d+/", "/locations/{id}/");
        String routeKey = requestEvent.getHttpMethod() + ":" + templatePath;

        context.getLogger().log(String.format("Handling request for route key %s", routeKey));

        return handlerMap.getOrDefault(routeKey, notFoundHandler).handle(requestEvent, context);
    }
}
