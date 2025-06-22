package com.restaurantbackendapp.repository;

import com.amazonaws.services.dynamodbv2.model.AmazonDynamoDBException;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.restaurantbackendapp.dto.TableRequestQueryParams;

public interface ReservationRepository {

    /**
     * Queries DynamoDB for available tables matching the specified criteria.
     *
     * @param params  The table request parameters
     * @param context The Lambda execution context
     * @return QueryResult containing matching table records
     * @throws AmazonDynamoDBException if the database query fails
     */
    QueryResult fetchAvailableTables(TableRequestQueryParams params, Context context);
}
