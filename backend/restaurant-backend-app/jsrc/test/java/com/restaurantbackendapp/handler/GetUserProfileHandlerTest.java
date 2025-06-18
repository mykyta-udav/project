package com.restaurantbackendapp.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.dto.UserProfileResponseDto;
import com.restaurantbackendapp.handler.impl.GetUserProfileHandler;
import com.restaurantbackendapp.handler.impl.UserContextResolver;
import com.restaurantbackendapp.model.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

public class GetUserProfileHandlerTest {
    private GetUserProfileHandler profileHandler;
    private Gson gson;
    private UserContextResolver userContextResolver;
    private Context context;
    private LambdaLogger logger;

    @BeforeEach
    void setUp() {
        gson = new Gson();
        userContextResolver = mock(UserContextResolver.class);
        profileHandler = new GetUserProfileHandler(gson, userContextResolver);

        context = mock(Context.class);
        logger = mock(LambdaLogger.class);
        when(context.getLogger()).thenReturn(logger);

        when(context.getLogger()).thenReturn(logger);
    }


    @Test
    void getUserProfile_whenValidClaims_return200Ok() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("custom:firstName", "John");
        claims.put("custom:lastName", "Doe");
        claims.put("custom:role", "Customer");
        claims.put("email", "john.doe@example.com");

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.CUSTOMER);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(200, response.getStatusCode());

        UserProfileResponseDto dto = gson.fromJson(response.getBody(), UserProfileResponseDto.class);
        assertEquals("John", dto.getFirstName());
        assertEquals("Doe", dto.getLastName());
        assertEquals("Customer", dto.getRole());
        assertEquals("john.doe@example.com", dto.getEmail());
    }


    @Test
    void getUserProfile_whenMissingClaims_return401() {
        var requestContext = mock(APIGatewayProxyRequestEvent.ProxyRequestContext.class);

        Map<String, Object> authorizer = new HashMap<>();
        when(requestContext.getAuthorizer()).thenReturn(authorizer);

        var request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);
        assertEquals(401, response.getStatusCode());
    }

    @Test
    void getUserProfile_whenInvalidRole_shouldAssignVisitorRole() {

        Map<String, Object> claims = new HashMap<>();
        claims.put("custom:firstName", "Guest");
        claims.put("custom:lastName", "User");
        claims.put("email", "guest_user@example.com");

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.VISITOR);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(200, response.getStatusCode());
        UserProfileResponseDto dto = gson.fromJson(response.getBody(), UserProfileResponseDto.class);
        assertEquals("Visitor", dto.getRole());
    }

    @Test
    void getUserProfile_whenUnknownGroup_returnsVisitorRole() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("custom:firstName", "Mystery");
        claims.put("custom:lastName", "User");
        claims.put("email", "mystery@example.com");
        claims.put("cognito:groups", List.of("UnknownGroup"));

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.VISITOR);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(200, response.getStatusCode());
        UserProfileResponseDto dto = gson.fromJson(response.getBody(), UserProfileResponseDto.class);
        assertEquals("Visitor", dto.getRole());
    }

    @Test
    void getUserProfile_whenExceptionThrown_returns500() {
        APIGatewayProxyRequestEvent request = mock(APIGatewayProxyRequestEvent.class);
        when(request.getRequestContext()).thenThrow(new RuntimeException("Test exception"));

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("Internal Server Error"));
    }

    @Test
    void getUserProfile_whenGroupIsString_returnsCorrectRole() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("custom:firstName", "Authenticated");
        claims.put("custom:lastName", "User");
        claims.put("email", "authenticated_user@example.com");
        claims.put("cognito:groups", "Customer");

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.CUSTOMER);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(200, response.getStatusCode());
        UserProfileResponseDto dto = gson.fromJson(response.getBody(), UserProfileResponseDto.class);
        assertEquals("Customer", dto.getRole());
    }
}
