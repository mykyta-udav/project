package com.restaurantbackendapp.handler;

import com.google.gson.Gson;
import com.restaurantbackendapp.dto.SignUpRequestDto;
import com.restaurantbackendapp.handler.impl.SignUpHandler;
import com.restaurantbackendapp.repository.UserRepository;
import com.restaurantbackendapp.repository.WaiterRepository;
import com.restaurantbackendapp.utils.RandomSecurePasswordGeneratorUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SignUpHandlerTest {
    CognitoIdentityProviderClient cognitoClient;
    WaiterRepository waiterRepository;
    UserRepository userRepository;
    Gson gson;
    RandomSecurePasswordGeneratorUtil passwordGenerator;
    Context context;
    SignUpHandler handler;

    @BeforeEach
    void setup() {
        cognitoClient = mock(CognitoIdentityProviderClient.class);
        waiterRepository = mock(WaiterRepository.class);
        userRepository = mock(UserRepository.class);
        gson = new Gson();
        passwordGenerator = mock(RandomSecurePasswordGeneratorUtil.class);
        context = mock(Context.class);
        handler = new SignUpHandler(cognitoClient, "userpool", waiterRepository, userRepository, gson, passwordGenerator);
    }

    @Test
    void returns400_whenFieldsMissing() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("");
        dto.setPassword("");
        dto.setFirstName("");
        dto.setLastName("");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(400, resp.getStatusCode());
        assertTrue(resp.getBody().contains("required"));
        verifyNoInteractions(cognitoClient, waiterRepository, userRepository);
    }


    @Test
    void setsWaiterRole_ifEmailIsInWaitersRepository() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("waiter@bar.com");
        dto.setPassword("Password1!");
        dto.setFirstName("F");
        dto.setLastName("L");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));

        when(cognitoClient.listUsers(any(ListUsersRequest.class)))
                .thenReturn(ListUsersResponse.builder().users(Collections.emptyList()).build());

        when(waiterRepository.existsByEmail("waiter@bar.com")).thenReturn(true);
        when(passwordGenerator.generate(anyInt())).thenReturn("TempPass123!");

        when(cognitoClient.adminCreateUser(any(AdminCreateUserRequest.class))).thenReturn(AdminCreateUserResponse.builder().build());
        when(cognitoClient.adminSetUserPassword(any(AdminSetUserPasswordRequest.class))).thenReturn(AdminSetUserPasswordResponse.builder().build());
        when(cognitoClient.adminAddUserToGroup(any(AdminAddUserToGroupRequest.class))).thenReturn(AdminAddUserToGroupResponse.builder().build());

        List<AttributeType> attributes = List.of(AttributeType.builder().name("sub").value("user-id-123").build());
        when(cognitoClient.adminGetUser(any(AdminGetUserRequest.class))).thenReturn(
                AdminGetUserResponse.builder().userAttributes(attributes).build());

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(201, resp.getStatusCode());
        assertTrue(resp.getBody().contains("User registered"));

        ArgumentCaptor<AdminAddUserToGroupRequest> groupCaptor = ArgumentCaptor.forClass(AdminAddUserToGroupRequest.class);
        verify(cognitoClient).adminAddUserToGroup(groupCaptor.capture());
        assertEquals("Waiter", groupCaptor.getValue().groupName());
        assertEquals("waiter@bar.com", groupCaptor.getValue().username());
    }

    @Test
    void setsCustomerRole_ifEmailNotInWaitersRepository() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("customer@bar.com");
        dto.setPassword("Password1!");
        dto.setFirstName("F");
        dto.setLastName("L");

        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));

        ListUsersResponse noUsers = ListUsersResponse.builder().users(Collections.emptyList()).build();
        when(cognitoClient.listUsers(any(ListUsersRequest.class))).thenReturn(noUsers);

        when(waiterRepository.existsByEmail("customer@bar.com")).thenReturn(false);
        when(passwordGenerator.generate(anyInt())).thenReturn("Temp123Pass!");

        when(cognitoClient.adminCreateUser(any(AdminCreateUserRequest.class))).thenReturn(AdminCreateUserResponse.builder().build());
        when(cognitoClient.adminSetUserPassword(any(AdminSetUserPasswordRequest.class))).thenReturn(AdminSetUserPasswordResponse.builder().build());
        when(cognitoClient.adminAddUserToGroup(any(AdminAddUserToGroupRequest.class))).thenReturn(AdminAddUserToGroupResponse.builder().build());

        List<AttributeType> attributes = List.of(AttributeType.builder().name("sub").value("user-id-456").build());
        AdminGetUserResponse getUserResponse = AdminGetUserResponse.builder().userAttributes(attributes).build();
        when(cognitoClient.adminGetUser(any(AdminGetUserRequest.class))).thenReturn(getUserResponse);

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(201, resp.getStatusCode());
        assertTrue(resp.getBody().contains("User registered"));

        ArgumentCaptor<AdminAddUserToGroupRequest> groupCaptor = ArgumentCaptor.forClass(AdminAddUserToGroupRequest.class);
        verify(cognitoClient).adminAddUserToGroup(groupCaptor.capture());
        assertEquals("Customer", groupCaptor.getValue().groupName());
        assertEquals("customer@bar.com", groupCaptor.getValue().username());
    }

    @Test
    void shouldReturn400WhenEmailAlreadyExistsInCognito() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("already@bar.com");
        dto.setPassword("Password1!");
        dto.setFirstName("F");
        dto.setLastName("L");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));
        ListUsersResponse noUsers = ListUsersResponse.builder().users(Collections.emptyList()).build();
        when(cognitoClient.listUsers(any(ListUsersRequest.class))).thenReturn(noUsers);
        when(waiterRepository.existsByEmail("already@bar.com")).thenReturn(false);
        when(cognitoClient.adminCreateUser(any(AdminCreateUserRequest.class))).thenThrow(UsernameExistsException.builder().message("exists").build());

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(400, resp.getStatusCode());
        assertTrue(resp.getBody().contains("Email already exists"));
    }

    @Test
    void returns400_whenPasswordInvalid() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("badpw@bar.com");
        dto.setPassword("short");
        dto.setFirstName("F");
        dto.setLastName("L");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));
        ListUsersResponse noUsers = ListUsersResponse.builder().users(Collections.emptyList()).build();
        when(cognitoClient.listUsers(any(ListUsersRequest.class))).thenReturn(noUsers);

        when(waiterRepository.existsByEmail("badpw@bar.com")).thenReturn(false);

        when(cognitoClient.adminCreateUser(any(AdminCreateUserRequest.class))).thenReturn(AdminCreateUserResponse.builder().build());
        when(cognitoClient.adminSetUserPassword(any(AdminSetUserPasswordRequest.class))).thenThrow(InvalidPasswordException.builder().message("pwd error").build());

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(400, resp.getStatusCode());
        assertTrue(resp.getBody().contains("complexity"));
    }

    @Test
    void shouldReturn500OnUnhandledException() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("crash@bar.com");
        dto.setPassword("Password1!");
        dto.setFirstName("Boom");
        dto.setLastName("Bang");

        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent()
                .withBody(new Gson().toJson(dto));

        when(cognitoClient.listUsers((ListUsersRequest) any())).thenReturn(ListUsersResponse.builder().users(Collections.emptyList()).build());
        when(waiterRepository.existsByEmail(anyString())).thenThrow(new RuntimeException("Boom"));

        var response = handler.handle(event, context);

        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("Internal server error"));
    }
}