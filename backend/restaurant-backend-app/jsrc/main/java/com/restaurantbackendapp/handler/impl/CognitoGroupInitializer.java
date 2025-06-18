package com.restaurantbackendapp.handler.impl;

import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.CreateGroupRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetGroupRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ResourceNotFoundException;

import javax.inject.Named;
import javax.inject.Singleton;

@Singleton
public class CognitoGroupInitializer {

    public CognitoGroupInitializer(CognitoIdentityProviderClient cognitoClient,
                                   @Named("userPoolId") String userPoolId) {
        ensureGroupExists("Customer", cognitoClient, userPoolId);
        ensureGroupExists("Waiter", cognitoClient, userPoolId);
    }

    private void ensureGroupExists(String groupName, CognitoIdentityProviderClient client, String poolId) {
        try {
            client.getGroup(GetGroupRequest.builder()
                    .groupName(groupName)
                    .userPoolId(poolId)
                    .build());
        } catch (ResourceNotFoundException e) {
            client.createGroup(CreateGroupRequest.builder()
                    .groupName(groupName)
                    .userPoolId(poolId)
                    .description(groupName + " group")
                    .build());
        }
    }
}
