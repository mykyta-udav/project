package com.restaurantbackendapp.repository;

import com.amazonaws.services.lambda.runtime.Context;
import com.restaurantbackendapp.dto.request.TableRequestQueryParams;
import com.restaurantbackendapp.model.Reservation;

import java.util.List;

public interface ReservationRepository {
    void createReservation(Reservation reservation);
    List<Reservation> fetchAllReservationsByTablesIds(List<String> tableIds, TableRequestQueryParams params, Context context);
}
