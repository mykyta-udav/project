package com.restaurantbackendapp;

import com.restaurantbackendapp.dto.request.TableRequestQueryParams;

public class ModelUtils {
    private ModelUtils() {}

    public static TableRequestQueryParams getTableRequestQueryParams() {
         return new TableRequestQueryParams("1", "2025-06-14", "12:00", "2");
    }
}
