package com.restaurantbackendapp.repository;

import com.amazonaws.services.dynamodbv2.model.ScanResult;

public interface LocationRepository {
    ScanResult findAllLocationAddresses();
}
