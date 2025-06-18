package com.restaurantbackendapp.handler.impl;


import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import com.google.gson.Gson;
import com.restaurantbackendapp.dto.UserProfileResponseDto;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.enums.UserRole;
import jakarta.inject.Inject;


import java.util.Map;

public class GetUserProfileHandler implements EndpointHandler {

    private final Gson gson;

    private final UserContextResolver userContextResolver;

    @Inject

    public GetUserProfileHandler(Gson gson, UserContextResolver userContextResolver) {
        this.gson = gson;
        this.userContextResolver = userContextResolver;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {
        try {
            Map<String, Object> claims = extractClaims(requestEvent);
            if (claims == null) {
                return unauthorizedResponse("Unauthorized - no claims found");
            }
            context.getLogger().log("Request Context: " + gson.toJson(requestEvent.getRequestContext()));

            String firstName = (String) claims.getOrDefault("custom:firstName", "");
            String lastName = (String) claims.getOrDefault("custom:lastName", "");
            String email = (String) claims.getOrDefault("email", "");

            UserRole role = userContextResolver.resolveUserRole(claims);
            if (role == null) {
                return errorResponse(500, "Invalid or missing user role in claims");
            }

            UserProfileResponseDto responseDto = UserProfileResponseDto.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(role.getValue())
                    .email(email)
                    .imageUrl("")
                    .build();

            return successResponse(responseDto);

        } catch (Exception e) {
            context.getLogger().log("Error getting user profile: " + e.getMessage());
            return errorResponse(500, "Internal Server Error");
        }


    }


    private Map<String, Object> extractClaims(APIGatewayProxyRequestEvent requestEvent) {
        return (Map<String, Object>) requestEvent
                .getRequestContext()
                .getAuthorizer()
                .get("claims");
    }

    private APIGatewayProxyResponseEvent unauthorizedResponse(String message) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(401)
                .withBody("{\"error\": \"" + message + "\"}");
    }

    private APIGatewayProxyResponseEvent errorResponse(int statusCode, String message) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withBody("{\"error\": \"" + message + "\"}");
    }

    private APIGatewayProxyResponseEvent successResponse(Object body) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withBody(gson.toJson(body));
    }
}
