package com.restaurantbackendapp.repository;

import com.amazonaws.services.lambda.runtime.Context;
import com.restaurantbackendapp.model.Table;
import java.util.List;

public interface TableRepository {
    List<Table> findAllTablesByLocationId(String locationId);
}
