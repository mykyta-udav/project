package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.kms.model.NotFoundException;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.restaurantbackendapp.exception.UnauthorizedException;
import com.restaurantbackendapp.model.User;
import com.restaurantbackendapp.repository.UserRepository;
import com.restaurantbackendapp.utils.TokenUtil;
import software.amazon.awssdk.auth.credentials.TokenUtils;

import javax.inject.Inject;
import java.util.Map;

public class UserContextService {
    private final UserRepository userRepository;

    @Inject
    public UserContextService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser(APIGatewayProxyRequestEvent requestEvent) {
        String cognitoId = TokenUtil.extractCognitoId(requestEvent);

        return userRepository.findById(cognitoId)
                .orElseThrow(() -> new NotFoundException("User not found in Database"));
    }
}
