package com.restaurantbackendapp.utils;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.restaurantbackendapp.exception.UnauthorizedException;

import java.util.Map;

public class TokenUtil {

    public static Map<String, Object> extractClaims(APIGatewayProxyRequestEvent requestEvent) {
        if (requestEvent == null || requestEvent.getRequestContext() == null) {
            throw new UnauthorizedException("Invalid request: no context found");
        }

        Map<String, Object> authorizer = requestEvent.getRequestContext().getAuthorizer();
        if (authorizer == null || !authorizer.containsKey("claims")) {
            throw new UnauthorizedException("Missing claims in authorizer context");
        }

        Map<String, Object> claims = (Map<String, Object>) authorizer.get("claims");
        if (claims == null || claims.isEmpty()) {
            throw new UnauthorizedException("Claims are empty or invalid");
        }

        return claims;
    }


    public static String extractCognitoId(APIGatewayProxyRequestEvent requestEvent) {
        Map<String, Object> claims = extractClaims(requestEvent);
        String cognitoId = (String) claims.get("sub");

        if (cognitoId == null || cognitoId.isBlank()) {
            throw new UnauthorizedException("Missing user ID in token");
        }

        return cognitoId;
    }
}
