package com.restaurantbackendapp.handler.impl;

import com.restaurantbackendapp.model.enums.UserRole;

import javax.inject.Inject;
import java.util.Map;

public class UserContextResolver {

    @Inject
    public UserContextResolver() {
    }

    public UserRole resolveUserRole(Map<String, Object> claims) {
        if (claims == null || claims.get("custom:role") == null) {
            return UserRole.VISITOR;
        }

        try {
            return UserRole.fromValue((String) claims.get("custom:role"));
        } catch (IllegalArgumentException e) {
            return UserRole.VISITOR;
        }
    }
}
