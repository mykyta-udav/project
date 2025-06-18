package com.restaurantbackendapp.handler;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.GetItemResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.dto.SignUpRequestDto;
import com.restaurantbackendapp.handler.impl.SignUpHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SignUpHandlerTest {

    private CognitoIdentityProviderClient cognitoClient;
    private AmazonDynamoDB dynamoDbClient;
    private Gson gson;
    private Context context;
    private SignUpHandler handler;

    @BeforeEach
    void setup() {
        cognitoClient = mock(CognitoIdentityProviderClient.class);
        dynamoDbClient = mock(AmazonDynamoDB.class);
        gson = new Gson();
        context = mock(Context.class);
        handler = new SignUpHandler(cognitoClient, "userpool", dynamoDbClient, gson);
    }

    @Test
    void returns400_whenFieldsMissing() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail(""); dto.setPassword(""); dto.setFirstName(""); dto.setLastName("");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(400, resp.getStatusCode());
        assertTrue(resp.getBody().contains("required"));
        verifyNoInteractions(cognitoClient, dynamoDbClient);
    }

    @Test
    void returns400_whenEmailExists() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("test@mail.com"); dto.setPassword("Password1!"); dto.setFirstName("Foo"); dto.setLastName("Bar");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));
        ListUsersResponse response = ListUsersResponse.builder()
                .users(UserType.builder().build())
                .build();

        when(cognitoClient.listUsers(any(ListUsersRequest.class))).thenReturn(response);

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(400, resp.getStatusCode());
        assertTrue(resp.getBody().contains("Email already exists"));
        verify(cognitoClient).listUsers(any(ListUsersRequest.class));
        verifyNoMoreInteractions(cognitoClient);
        verifyNoInteractions(dynamoDbClient);
    }

    @Test
    void setsWaiterRole_ifEmailIsInWaitersTable() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("waiter@bar.com"); dto.setPassword("Password1!"); dto.setFirstName("F"); dto.setLastName("L");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));
        ListUsersResponse noUsers = ListUsersResponse.builder().users(Collections.emptyList()).build();
        when(cognitoClient.listUsers(any(ListUsersRequest.class))).thenReturn(noUsers);

        GetItemResult getItemResult = new GetItemResult().withItem(Map.of("email", new AttributeValue().withS("waiter@bar.com")));
        when(dynamoDbClient.getItem(any())).thenReturn(getItemResult);

        when(cognitoClient.adminCreateUser(any(AdminCreateUserRequest.class))).thenReturn(AdminCreateUserResponse.builder().build());
        when(cognitoClient.adminSetUserPassword(any(AdminSetUserPasswordRequest.class))).thenReturn(AdminSetUserPasswordResponse.builder().build());
        when(cognitoClient.adminAddUserToGroup(any(AdminAddUserToGroupRequest.class))).thenReturn(AdminAddUserToGroupResponse.builder().build());

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(201, resp.getStatusCode());
        assertTrue(resp.getBody().contains("User registered"));

        ArgumentCaptor<AdminAddUserToGroupRequest> groupCaptor = ArgumentCaptor.forClass(AdminAddUserToGroupRequest.class);
        verify(cognitoClient).adminAddUserToGroup(groupCaptor.capture());
        assertEquals("Waiter", groupCaptor.getValue().groupName());
        assertEquals("waiter@bar.com", groupCaptor.getValue().username());
    }

    @Test
    void setsCustomerRole_ifEmailNotInWaitersTable() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("customer@bar.com"); dto.setPassword("Password1!"); dto.setFirstName("F"); dto.setLastName("L");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));
        ListUsersResponse noUsers = ListUsersResponse.builder().users(Collections.emptyList()).build();
        when(cognitoClient.listUsers(any(ListUsersRequest.class))).thenReturn(noUsers);

        GetItemResult getItemResult = new GetItemResult().withItem(null);
        when(dynamoDbClient.getItem(any())).thenReturn(getItemResult);

        when(cognitoClient.adminCreateUser(any(AdminCreateUserRequest.class))).thenReturn(AdminCreateUserResponse.builder().build());
        when(cognitoClient.adminSetUserPassword(any(AdminSetUserPasswordRequest.class))).thenReturn(AdminSetUserPasswordResponse.builder().build());
        when(cognitoClient.adminAddUserToGroup(any(AdminAddUserToGroupRequest.class))).thenReturn(AdminAddUserToGroupResponse.builder().build());

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(201, resp.getStatusCode());
        assertTrue(resp.getBody().contains("User registered"));

        ArgumentCaptor<AdminAddUserToGroupRequest> groupCaptor = ArgumentCaptor.forClass(AdminAddUserToGroupRequest.class);
        verify(cognitoClient).adminAddUserToGroup(groupCaptor.capture());
        assertEquals("Customer", groupCaptor.getValue().groupName());
    }

    @Test
    void returns400_whenCognitoSaysUserExists() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("already@bar.com"); dto.setPassword("Password1!"); dto.setFirstName("F"); dto.setLastName("L");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));
        ListUsersResponse noUsers = ListUsersResponse.builder().users(Collections.emptyList()).build();
        when(cognitoClient.listUsers(any(ListUsersRequest.class))).thenReturn(noUsers);

        when(dynamoDbClient.getItem(any())).thenReturn(new GetItemResult().withItem(null));
        when(cognitoClient.adminCreateUser(any(AdminCreateUserRequest.class))).thenThrow(UsernameExistsException.builder().message("exists").build());

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(400, resp.getStatusCode());
        assertTrue(resp.getBody().contains("already exists"));
    }

    @Test
    void returns400_whenPasswordInvalid() {
        SignUpRequestDto dto = new SignUpRequestDto();
        dto.setEmail("badpw@bar.com"); dto.setPassword("short"); dto.setFirstName("F"); dto.setLastName("L");
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent().withBody(gson.toJson(dto));
        ListUsersResponse noUsers = ListUsersResponse.builder().users(Collections.emptyList()).build();
        when(cognitoClient.listUsers(any(ListUsersRequest.class))).thenReturn(noUsers);

        when(dynamoDbClient.getItem(any())).thenReturn(new GetItemResult().withItem(null));
        when(cognitoClient.adminCreateUser(any(AdminCreateUserRequest.class))).thenReturn(AdminCreateUserResponse.builder().build());
        when(cognitoClient.adminSetUserPassword(any(AdminSetUserPasswordRequest.class))).thenThrow(InvalidPasswordException.builder().message("pwd error").build());

        APIGatewayProxyResponseEvent resp = handler.handle(event, context);

        assertEquals(400, resp.getStatusCode());
        assertTrue(resp.getBody().contains("complexity"));
    }
}