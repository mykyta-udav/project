package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.dto.SignUpRequestDto;
import com.restaurantbackendapp.repository.WaiterRepository;
import lombok.experimental.FieldDefaults;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import javax.inject.Inject;
import javax.inject.Named;
import java.security.SecureRandom;
import java.util.Map;

import static lombok.AccessLevel.PRIVATE;

@FieldDefaults(level = PRIVATE, makeFinal = true)
public class SignUpHandler implements EndpointHandler {

    CognitoIdentityProviderClient cognitoClient;
    String userPoolId;
    Gson gson;
    WaiterRepository waiterRepository;

    static String GROUP_CUSTOMER = "Customer";
    private static final String GROUP_WAITER = "Waiter";
    static int TEMP_PASSWORD_LENGTH = 12;

    @Inject
    public SignUpHandler(
            @Named("cognitoClient") CognitoIdentityProviderClient cognitoClient,
            @Named("userPoolId") String userPoolId,
            WaiterRepository waiterRepository,
            Gson gson
    ) {
        this.cognitoClient = cognitoClient;
        this.userPoolId = userPoolId;
        this.waiterRepository = waiterRepository;
        this.gson = gson;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent request, Context context) {
        try {
            SignUpRequestDto signUpRequest = gson.fromJson(request.getBody(), SignUpRequestDto.class);

            if (signUpRequest == null ||
                    signUpRequest.getEmail().isBlank() ||
                    signUpRequest.getPassword().isBlank() ||
                    signUpRequest.getFirstName().isBlank() ||
                    signUpRequest.getLastName().isBlank()
            ) {
                return response(400, "Email, password, firstName and lastName are required");
            }

            String email = signUpRequest.getEmail().trim();

            ListUsersRequest listUsersRequest = ListUsersRequest.builder()
                    .userPoolId(userPoolId)
                    .filter("email=\"" + email + "\"")
                    .build();

            ListUsersResponse listUsersResponse = cognitoClient.listUsers(listUsersRequest);
            if (!listUsersResponse.users().isEmpty()) {
                return response(400, "Email already exists");
            }
            String roleGroup = waiterRepository.existsByEmail(email) ? GROUP_WAITER : GROUP_CUSTOMER;

            AttributeType emailAttr = AttributeType.builder().name("email").value(email).build();
            AttributeType emailVerifiedAttr = AttributeType.builder().name("email_verified").value("true").build();
            AttributeType firstNameAttr = AttributeType.builder().name("custom:firstName").value(signUpRequest.getFirstName().trim()).build();
            AttributeType lastNameAttr = AttributeType.builder().name("custom:lastName").value(signUpRequest.getLastName().trim()).build();

            String tempPassword = generateSecureTempPassword();

            AdminCreateUserRequest createUserRequest = AdminCreateUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(email)
                    .userAttributes(emailAttr, emailVerifiedAttr, firstNameAttr, lastNameAttr)
                    .temporaryPassword(tempPassword)
                    .messageAction(MessageActionType.SUPPRESS)
                    .build();

            cognitoClient.adminCreateUser(createUserRequest);

            AdminSetUserPasswordRequest setUserPasswordRequest = AdminSetUserPasswordRequest.builder()
                    .userPoolId(userPoolId)
                    .username(email)
                    .password(signUpRequest.getPassword())
                    .permanent(true)
                    .build();

            cognitoClient.adminSetUserPassword(setUserPasswordRequest);

            AdminAddUserToGroupRequest addToGroupRequest = AdminAddUserToGroupRequest.builder()
                    .userPoolId(userPoolId)
                    .username(email)
                    .groupName(roleGroup)
                    .build();

            cognitoClient.adminAddUserToGroup(addToGroupRequest);

            return response(201, "User registered successfully");

        } catch (UsernameExistsException e) {
            return response(400, "Email already exists");
        } catch (InvalidPasswordException e) {
            return response(400, "Password does not meet complexity requirements");
        } catch (Exception e) {
            if (context != null && context.getLogger() != null) {
                context.getLogger().log("[SignUpHandler][ERROR] " + e.getMessage());
            }
            return response(500, "Internal server error");
        }
    }

    private APIGatewayProxyResponseEvent response(int statusCode, String message) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withBody(gson.toJson(Map.of("message", message)));
    }

    private String generateSecureTempPassword() {
        String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
        String CHAR_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String NUMBER = "0123456789";
        String SPECIAL_CHARS = "!@#$%&*()-_=+";
        String PASSWORD_ALLOW_BASE = CHAR_LOWER + CHAR_UPPER + NUMBER + SPECIAL_CHARS;
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(TEMP_PASSWORD_LENGTH);

        sb.append(CHAR_LOWER.charAt(random.nextInt(CHAR_LOWER.length())));
        sb.append(CHAR_UPPER.charAt(random.nextInt(CHAR_UPPER.length())));
        sb.append(NUMBER.charAt(random.nextInt(NUMBER.length())));
        sb.append(SPECIAL_CHARS.charAt(random.nextInt(SPECIAL_CHARS.length())));
        for (int i = 4; i < TEMP_PASSWORD_LENGTH; i++) {
            int rndCharAt = random.nextInt(PASSWORD_ALLOW_BASE.length());
            sb.append(PASSWORD_ALLOW_BASE.charAt(rndCharAt));
        }
        return sb.toString();
    }
}
