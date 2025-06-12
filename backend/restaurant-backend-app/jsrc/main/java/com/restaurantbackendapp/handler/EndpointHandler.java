package com.restaurantbackendapp.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import dagger.Provides;


public interface EndpointHandler {
    APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context);
}
