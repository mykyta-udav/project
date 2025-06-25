package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.kms.model.NotFoundException;
import com.restaurantbackendapp.model.User;
import com.restaurantbackendapp.repository.UserRepository;
import javax.inject.Inject;

public class UserContextService {
    private final UserRepository userRepository;
    @Inject
    public UserContextService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser(String cognitoId) {

        return userRepository.findById(cognitoId)
                .orElseThrow(() -> new NotFoundException("User not found in Database"));
    }
}
