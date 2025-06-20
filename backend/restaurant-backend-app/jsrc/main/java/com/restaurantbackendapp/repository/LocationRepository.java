package com.restaurantbackendapp.repository;

import com.restaurantbackendapp.model.Location;

import java.util.List;

public interface LocationRepository {
    List<Location> findAllLocationAddresses();
    List<Location> findSpecialityDishesByLocationId(String locationId);
}
