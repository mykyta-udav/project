package com.restaurantbackendapp.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;


public interface EndpointHandler {
    APIGatewayProxyResponseEvent handle(APIGatewayV2HTTPEvent requestEvent, Context context);
}
