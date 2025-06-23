package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.kms.model.NotFoundException;
import com.restaurantbackendapp.exception.UnauthorizedException;
import com.restaurantbackendapp.model.User;
import com.restaurantbackendapp.repository.UserRepository;

import javax.inject.Inject;
import java.util.Map;

public class UserContextService {
    private final UserRepository userRepository;

    @Inject
    public UserContextService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser(Map<String, Object> claims) {
        String cognitoId = (String) claims.get("sub");
        if (cognitoId == null || cognitoId.isBlank()) {
            throw new UnauthorizedException("Missing user ID in token");
        }

        return userRepository.findById(cognitoId)
                .orElseThrow(() -> new NotFoundException("User not found in Database"));
    }
}
