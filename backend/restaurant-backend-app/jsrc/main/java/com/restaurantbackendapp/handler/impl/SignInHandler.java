package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurantbackendapp.dto.SignInRequestDto;
import com.restaurantbackendapp.dto.SignInResponseDto;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.User;
import com.restaurantbackendapp.repository.UserRepository;
import lombok.experimental.FieldDefaults;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.*;

import static lombok.AccessLevel.PRIVATE;

@FieldDefaults(level = PRIVATE, makeFinal = true)
public class SignInHandler implements EndpointHandler {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    CognitoIdentityProviderClient cognitoClient;
    String userPoolId;
    String userPoolClientId;
    UserRepository userRepository;

    @Inject
    public SignInHandler(@Named("cognitoClient") CognitoIdentityProviderClient cognitoClient,
                         UserRepository userRepository) {

        this.cognitoClient = cognitoClient;
        this.userRepository = userRepository;
        this.userPoolId = System.getenv("COGNITO_ID");
        this.userPoolClientId = System.getenv("CLIENT_ID");
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {

        // Parse the request body to get email and password
        SignInRequestDto requestDto;
        try {
            requestDto = objectMapper.readValue(requestEvent.getBody(), SignInRequestDto.class);
        } catch (Exception e) {
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

        //System.out.println(authResponse);

        AuthenticationResultType authResult = authResponse.authenticationResult();

        // System.out.println(authResult);

        AdminGetUserRequest userIdRequest = AdminGetUserRequest.builder()
                .userPoolId(userPoolId)
                .username(requestDto.getEmail())
                .build();

        AdminGetUserResponse userResponse = cognitoClient.adminGetUser(userIdRequest);

        String cognitoId = userResponse.userAttributes().stream()
                .filter(attr -> "sub".equals(attr.name()))
                .map(AttributeType::value)
                .findFirst()
                .orElse(null);

        if (cognitoId == null || cognitoId.isBlank()) {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(404)
                    .withBody("{\"message\": \"Could not extract Cognito user ID\"}");
        }

        Optional<User> userOpt = userRepository.findById(cognitoId);
        if (userOpt.isEmpty()) {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(404)
                    .withBody("{\"message\": \"User not found in DB\"}");
        }
        User user = userOpt.get();
        String displayName = (user.getFirstName() + " " + user.getLastName()).trim();

        // Get user groups and role
        AdminListGroupsForUserRequest groupsRequest = AdminListGroupsForUserRequest.builder()
                .userPoolId(userPoolId)
                .username(requestDto.getEmail())
                .build();

        AdminListGroupsForUserResponse groupsResponse = cognitoClient.adminListGroupsForUser(groupsRequest);

        Optional<String> roleOpt = groupsResponse.groups().stream()
                .map(GroupType::groupName)
                .findFirst();

        if (roleOpt.isEmpty()) {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(403)
                    .withBody("{\"message\": \"User does not belong to any group\"}");
        }

        String role = roleOpt.get();

        // Get user attributes to extract display name
//        AdminGetUserRequest userRequest = AdminGetUserRequest.builder()
//                .userPoolId(userPoolId)
//                .username(requestDto.getEmail())
//                .build();


//        AdminGetUserResponse userResponse = cognitoClient.adminGetUser(userRequest);
//
//
//
//
//        // Extract username (display name) from attributes
//        String displayName = userResponse.userAttributes().stream()
//                .filter(attr -> attr.name().equals("name"))
//                .map(AttributeType::value)
//                .findFirst()
//                .orElse(requestDto.getEmail()); // Fall back to email if no name attribute


        SignInResponseDto responseDto = new SignInResponseDto(
                authResult.idToken(),
                displayName,
                role
        );

        String responseBody;
        try {
            responseBody = objectMapper.writeValueAsString(responseDto);
        } catch (Exception e) {
            //TODO: make a reasonable return statement
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(403)
                    .withBody("{\"message\": \"Error returning data\"}");
        }

        return new APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withBody(responseBody);
    }
}
