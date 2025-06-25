package com.restaurantbackendapp.handler.impl;


import com.amazonaws.services.kms.model.NotFoundException;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import com.google.gson.Gson;
import com.restaurantbackendapp.dto.UserProfileResponseDto;
import com.restaurantbackendapp.exception.UnauthorizedException;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.User;
import com.restaurantbackendapp.model.enums.UserRole;
import com.restaurantbackendapp.utils.TokenUtil;
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

            context.getLogger().log("Request Context: " + gson.toJson(requestEvent.getRequestContext()));



            Map<String, Object> claims = TokenUtil.extractClaims(requestEvent);
            String cognitoId = TokenUtil.extractCognitoId(requestEvent);

            User user = userContextService.getCurrentUser(cognitoId);

            UserRole role = userContextResolver.resolveUserRole(claims);
            if (role == null || role == UserRole.VISITOR) {
                return unauthorizedResponse("Invalid or missing user role in claims");
            }

            UserProfileResponseDto responseDto = UserProfileResponseDto.builder()
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .role(role.getValue())
                    .email(user.getEmail())
                    .imageUrl(user.getProfileImageUrl())
                    .build();

            return successResponse(responseDto);

        } catch (UnauthorizedException e) {
            context.getLogger().log("Unauthorized: " + e.getMessage());
            return unauthorizedResponse(e.getMessage());
        } catch (NotFoundException e) {
            context.getLogger().log("User not found: " + e.getMessage());
            return errorResponse(404, e.getMessage());
        } catch (Exception e) {
            context.getLogger().log("Error getting user profile: " + e.getMessage());
            return errorResponse(500, "Internal Server Error");
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
