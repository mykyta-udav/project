package com.restaurantbackendapp.handler.impl;


import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import com.google.gson.Gson;
import com.restaurantbackendapp.dto.UserProfileResponseDto;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.User;
import com.restaurantbackendapp.model.enums.UserRole;
import jakarta.inject.Inject;
import lombok.experimental.FieldDefaults;

import java.util.Map;

import static lombok.AccessLevel.PRIVATE;

@FieldDefaults(level = PRIVATE, makeFinal = true)
public class GetUserProfileHandler implements EndpointHandler {
    Gson gson;
    UserContextResolver userContextResolver;

    UserContextService userContextService;

    @Inject

    public GetUserProfileHandler(Gson gson, UserContextResolver userContextResolver, UserContextService userContextService) {
        this.gson = gson;
        this.userContextResolver = userContextResolver;
        this.userContextService = userContextService;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {
        try {
            Map<String, Object> claims = extractClaims(requestEvent);
            if (claims == null || claims.isEmpty()) {
                return unauthorizedResponse("Unauthorized - no claims found");
            }
            context.getLogger().log("Request Context: " + gson.toJson(requestEvent.getRequestContext()));

            User user = userContextService.getCurrentUser(claims);

            UserRole role = userContextResolver.resolveUserRole(claims);
            if (role == null) {
                return errorResponse(500, "Invalid or missing user role in claims");
            }

            UserProfileResponseDto responseDto = UserProfileResponseDto.builder()
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .role(role.getValue())
                    .email(user.getEmail())
                    .imageUrl(user.getProfileImageUrl())
                    .build();

            return successResponse(responseDto);

        } catch (Exception e) {
            context.getLogger().log("Error getting user profile: " + e.getMessage());
            return errorResponse(500, "Internal Server Error");
        }

    }

    private Map<String, Object> extractClaims(APIGatewayProxyRequestEvent requestEvent) {
        try {
            return (Map<String, Object>) requestEvent.getRequestContext()
                    .getAuthorizer()
                    .get("claims");
        } catch (Exception e) {
            return null;
        }
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
