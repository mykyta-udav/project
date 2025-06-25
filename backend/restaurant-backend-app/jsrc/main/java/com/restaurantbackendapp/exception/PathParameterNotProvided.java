package com.restaurantbackendapp.exception;

public class PathParameterNotProvided extends  RuntimeException {
    public PathParameterNotProvided(String message) {
        super(message);
    }
}
