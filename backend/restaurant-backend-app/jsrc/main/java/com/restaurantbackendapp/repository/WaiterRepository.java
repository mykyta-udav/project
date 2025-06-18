package com.restaurantbackendapp.repository;

public interface WaiterRepository {
    boolean existsByEmail(String email);
}
