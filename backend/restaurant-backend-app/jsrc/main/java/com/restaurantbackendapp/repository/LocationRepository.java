package com.restaurantbackendapp.repository;

import com.amazonaws.services.lambda.runtime.Context;
import com.restaurantbackendapp.dto.TableRequestQueryParams;
import com.restaurantbackendapp.exception.LocationNotFoundException;
import com.restaurantbackendapp.model.Location;
import java.util.List;
import java.util.Optional;

public interface LocationRepository {

    /**
     * Retrieves a list of all locations along with their addresses.
     * This method queries the locations table to fetch all location entries and their associated addresses.
     * It is typically used for scenarios where addresses for all locations are needed, such as populating
     * dropdowns, maps, or reports.
     *
     * @return A list of `Location` objects, each containing a location's address and other details.
     */
    List<Location> findAllLocationAddresses();

    /**
     * Retrieves a list of speciality dishes for a specific location based on its location ID.
     * This method queries the locations table to fetch the list of speciality dishes associated
     * with the given location ID. It is particularly useful for displaying speciality dishes
     * for a specific restaurant location in the application.
     * @param locationId The unique identifier of the location for which speciality dishes are to be retrieved.
     * @return A list of `Location` objects representing the speciality dishes for the specified location.
     */
    List<Location> findSpecialityDishesByLocationId(String locationId);
    /**
     * Retrieves the address for a given location ID from the locations table.
     *
     * @param tableRequestQueryParams The table request parameters containing the location ID
     * @param context The Lambda execution context
     * @return The address string for the specified location
     * @throws LocationNotFoundException if the location is not found
     */
    String fetchLocationAddress(TableRequestQueryParams tableRequestQueryParams, Context context);
}
