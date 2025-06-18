package com.restaurantbackendapp.model.enums;

public enum UserRole {
    CUSTOMER("Customer"),
    WAITER("Waiter"),
    VISITOR("Visitor");


    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("User role value cannot be null");
        }
        for (UserRole role : UserRole.values()) {
            if (role.getValue().equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid user role: " + value);
    }
}
