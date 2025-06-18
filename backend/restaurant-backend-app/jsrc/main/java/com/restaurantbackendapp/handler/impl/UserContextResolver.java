package com.restaurantbackendapp.handler.impl;

import com.restaurantbackendapp.model.enums.UserRole;

import javax.inject.Inject;
import java.util.List;
import java.util.Map;

public class UserContextResolver {

    @Inject
    public UserContextResolver() {
    }

    public UserRole resolveUserRole(Map<String, Object> claims) {
        if (claims == null || !claims.containsKey("cognito:groups")) {
            return UserRole.VISITOR;
        }

        Object rawGroups = claims.get("cognito:groups");

        if (rawGroups instanceof List<?>) {
            List<?> groups = (List<?>) rawGroups;
            for (Object group : groups) {
                if ("Waiter".equals(group)) return UserRole.WAITER;
                if ("Customer".equals(group)) return UserRole.CUSTOMER;
            }
        } else if (rawGroups instanceof String) {
            String group = (String) rawGroups;
            if ("Waiter".equals(group)) return UserRole.WAITER;
            if ("Customer".equals(group)) return UserRole.CUSTOMER;
        }

        return UserRole.VISITOR;
    }
}
