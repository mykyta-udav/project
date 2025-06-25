package com.restaurantbackendapp.repository;

import com.restaurantbackendapp.model.User;

import java.util.Optional;

public interface UserRepository {
    void save(User user);

    Optional<User> findById(String cognitoId);

}
