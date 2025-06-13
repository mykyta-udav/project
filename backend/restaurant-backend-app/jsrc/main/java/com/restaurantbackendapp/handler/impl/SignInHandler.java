package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurantbackendapp.dto.SignInRequestDto;
import com.restaurantbackendapp.dto.SignInResponseDto;
import com.restaurantbackendapp.handler.EndpointHandler;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.*;

public class SignInHandler implements EndpointHandler {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final CognitoIdentityProviderClient cognitoClient;

    private final String userPoolId;
    private final String userPoolClientId;

    @Inject
    public SignInHandler(@Named("cognitoClient") CognitoIdentityProviderClient cognitoClient) {
        this.cognitoClient = cognitoClient;

        this.userPoolId = System.getenv("COGNITO_ID");
        this.userPoolClientId = System.getenv("CLIENT_ID");
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {

        // Parse the request body to get email and password
        SignInRequestDto requestDto;
        try {
            requestDto = objectMapper.readValue(requestEvent.getBody(), SignInRequestDto.class);
        }
        catch (Exception e) {
            System.err.println("Error parsing JSON: " + e.getMessage());
            System.err.println("Raw request body: " + requestEvent.getBody());

            //TODO: make a reasonable return statement
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody("{\"message\": \"Invalid request body\"}");
        }

        // Get user JWT Token
        AdminInitiateAuthRequest authRequest = AdminInitiateAuthRequest.builder()
                .userPoolId(userPoolId)
                .clientId(userPoolClientId)
                .authFlow(AuthFlowType.ADMIN_USER_PASSWORD_AUTH)
                .authParameters(Map.of(
                        "USERNAME", requestDto.getEmail(),
                        "PASSWORD", requestDto.getPassword()
                ))
                .build();

        AdminInitiateAuthResponse authResponse = cognitoClient.adminInitiateAuth(authRequest);

        System.out.println(authResponse);

        AuthenticationResultType authResult = authResponse.authenticationResult();

        System.out.println(authResult);

        // Get user groups and role
        AdminListGroupsForUserRequest groupsRequest = AdminListGroupsForUserRequest.builder()
                .userPoolId(userPoolId)
                .username(requestDto.getEmail())
                .build();

        AdminListGroupsForUserResponse groupsResponse = cognitoClient.adminListGroupsForUser(groupsRequest);

        Optional<String> roleOp = groupsResponse.groups().stream()
                .map(GroupType::groupName)
                .findFirst();

        // Get user attributes to extract display name
        AdminGetUserRequest userRequest = AdminGetUserRequest.builder()
                .userPoolId(userPoolId)
                .username(requestDto.getEmail())
                .build();

        AdminGetUserResponse userResponse = cognitoClient.adminGetUser(userRequest);

        if (roleOp.isEmpty()) {
            //TODO: make a reasonable return statement
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(403)
                    .withBody("{\"message\": \"User does not belong to any group\"}");
        }

        String role = roleOp.get();


        // Extract username (display name) from attributes
        String displayName = userResponse.userAttributes().stream()
                .filter(attr -> attr.name().equals("name"))
                .map(AttributeType::value)
                .findFirst()
                .orElse(requestDto.getEmail()); // Fall back to email if no name attribute


        SignInResponseDto responseDto = new SignInResponseDto(
                authResult.accessToken(),
                displayName,
                role
        );

        String resopnseBody;
        try {
            resopnseBody = objectMapper.writeValueAsString(responseDto);
        }
        catch (Exception e) {
            //TODO: make a reasonable return statement
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(403)
                    .withBody("{\"message\": \"Error returning data\"}");
        }

        return new APIGatewayProxyResponseEvent()
                        .withStatusCode(200)
                        .withBody(resopnseBody);
    }
}
