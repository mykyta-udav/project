package com.restaurantbackendapp.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.dto.UserProfileResponseDto;
import com.restaurantbackendapp.exception.UnauthorizedException;
import com.restaurantbackendapp.handler.impl.GetUserProfileHandler;
import com.restaurantbackendapp.handler.impl.UserContextResolver;
import com.restaurantbackendapp.handler.impl.UserContextService;
import com.restaurantbackendapp.model.User;
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
    GetUserProfileHandler profileHandler;
    Gson gson;
    UserContextResolver userContextResolver;

    UserContextService userContextService;
    Context context;
    LambdaLogger logger;

    @BeforeEach
    void setUp() {
        gson = new Gson();
        userContextResolver = mock(UserContextResolver.class);
        userContextService = mock(UserContextService.class);
        profileHandler = new GetUserProfileHandler(gson, userContextResolver, userContextService);
        context = mock(Context.class);
        logger = mock(LambdaLogger.class);
        when(context.getLogger()).thenReturn(logger);
        doNothing().when(logger).log(anyString());
    }


    @Test
    void getUserProfile_whenValidClaims_return200Ok() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("cognito:groups", List.of("Customer"));
        claims.put("email", "john.doe@example.com");
        claims.put("sub", "user-sub-id-123");

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);


        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.CUSTOMER);

        User mockUser = new User(
                "user-sub-id-123",
                "john.doe@example.com",
                "John",
                "Doe",
                "https://example.com/profile.jpg",
                UserRole.CUSTOMER
        );
        when(userContextService.getCurrentUser("user-sub-id-123")).thenReturn(mockUser);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(200, response.getStatusCode());

        UserProfileResponseDto dto = gson.fromJson(response.getBody(), UserProfileResponseDto.class);
        assertEquals("John", dto.getFirstName());
        assertEquals("Doe", dto.getLastName());
        assertEquals("Customer", dto.getRole());
        assertEquals("john.doe@example.com", dto.getEmail());
        assertEquals("https://example.com/profile.jpg", dto.getImageUrl());
    }


    @Test
    void getUserProfile_whenMissingClaims_return401() {
        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = mock(APIGatewayProxyRequestEvent.ProxyRequestContext.class);
        when(requestContext.getAuthorizer()).thenReturn(new HashMap<>());

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(401, response.getStatusCode());
    }

    @Test
    void getUserProfile_whenInvalidRole_shouldAssignVisitorRole() {
        Map<String, Object> claims = new HashMap<>();

        claims.put("email", "guest_user@example.com");

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.VISITOR);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(401, response.getStatusCode());
    }

    @Test
    void getUserProfile_whenUnknownGroup_returnsVisitorRole() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("cognito:groups", List.of("UnknownGroup"));

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.VISITOR);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(401, response.getStatusCode());

        String body = response.getBody();
        assertEquals("{\"error\": \"Missing user ID in token\"}", body);
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
        claims.put("cognito:groups", List.of("Customer"));
        claims.put("email", "john.doe@example.com");
        claims.put("sub", "user-sub-id-123");

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.CUSTOMER);

        User mockUser = new User(
                "user-sub-id-123",
                "john.doe@example.com",
                "John",
                "Doe",
                "https://example.com/profile.jpg",
                UserRole.CUSTOMER
        );
        when(userContextService.getCurrentUser("user-sub-id-123")).thenReturn(mockUser);

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(200, response.getStatusCode());

        UserProfileResponseDto dto = gson.fromJson(response.getBody(), UserProfileResponseDto.class);
        assertEquals("Customer", dto.getRole());
    }

    @Test
    void getUserProfile_whenUnauthorizedExceptionThrown_returns401() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "user-sub-id-123");
        claims.put("cognito:groups", List.of("Customer"));
        claims.put("email", "unauthorized@example.com");

        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("claims", claims);

        APIGatewayProxyRequestEvent.ProxyRequestContext requestContext = new APIGatewayProxyRequestEvent.ProxyRequestContext();
        requestContext.setAuthorizer(authorizer);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setRequestContext(requestContext);

        when(userContextResolver.resolveUserRole(claims)).thenReturn(UserRole.CUSTOMER);


        when(userContextService.getCurrentUser("user-sub-id-123"))
                .thenThrow(new UnauthorizedException("Access denied"));

        APIGatewayProxyResponseEvent response = profileHandler.handle(request, context);

        assertEquals(401, response.getStatusCode());
        assertTrue(response.getBody().contains("Access denied"));
    }

}
