package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.AmazonDynamoDBException;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.GetItemRequest;
import com.amazonaws.services.dynamodbv2.model.GetItemResult;
import com.amazonaws.services.dynamodbv2.model.QueryRequest;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.restaurantbackendapp.dto.TableRequestQueryParams;
import com.restaurantbackendapp.repository.ReservationRepository;
import org.apache.commons.lang3.StringUtils;
import javax.inject.Named;
import java.util.HashMap;
import java.util.Map;

public class ReservationRepositoryImpl implements ReservationRepository {
    public static final String LOCATION_ID = "locationId";
    public static final String AVAILABLE = "AVAILABLE";
    public static final String ADDRESS = "locationAddress";
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String TIME = "time";
    public static final String ERROR = "Error: ";
    public static final String DATE = "date";
    public static final String STATUS = "status";
    private final AmazonDynamoDB dynamoDbClient;
    public static final String RESERVATIONS_TABLE = "RESERVATIONS_TABLE";
    public static final String LOCATIONS_TABLE = "LOCATIONS_TABLE";

    public ReservationRepositoryImpl(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    @Override
    public QueryResult fetchAvailableTables(TableRequestQueryParams params, Context context) {
        QueryRequest queryRequest = new QueryRequest()
                .withTableName(System.getenv(RESERVATIONS_TABLE))
                .withIndexName("LocationDateIndex")
                .withKeyConditionExpression("locationId = :locationId")
                .withFilterExpression(buildFilterExpression(params))
                .withExpressionAttributeNames(createExpressionAttributeNames(params))
                .withExpressionAttributeValues(createExpressionAttributeValues(params));
        try {
            QueryResult result = dynamoDbClient.query(queryRequest);
            context.getLogger().log(String.format("Query successful, items count: %s", result.getCount()));
            return result;
        } catch (Exception e) {
            context.getLogger().log("Failed to execute DynamoDB query" + e.getMessage());
            throw new AmazonDynamoDBException("Failed to query Reservations table: " + e.getMessage());
        }
    }

    @Override
    public String fetchLocationAddress(TableRequestQueryParams tableRequestQueryParams, Context context) {
        String tableName = System.getenv(LOCATIONS_TABLE);
        context.getLogger().log(String.format("Fetching from locations table: %s", tableName));

        GetItemRequest getItemRequest = new GetItemRequest()
                .withTableName(System.getenv(LOCATIONS_TABLE))
                .withKey(Map.of(
                        LOCATION_ID, new AttributeValue().withS(tableRequestQueryParams.locationId())
                ));
        try {
            GetItemResult getItemResult = dynamoDbClient.getItem(getItemRequest);
            return getItemResult.getItem().get(ADDRESS).getS();
        } catch (Exception e) {
            throw new AmazonDynamoDBException("Failed to query Locations table: " + e.getMessage());
        }

    }

    private Map<String, AttributeValue> createExpressionAttributeValues(TableRequestQueryParams params) {
        Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();

        expressionAttributeValues.put(":locationId", new AttributeValue().withS(params.locationId()));
        expressionAttributeValues.put(":status", new AttributeValue().withS(AVAILABLE));

        if (StringUtils.isNotBlank(params.date())) {
            expressionAttributeValues.put(":date", new AttributeValue().withS(params.date()));
        }
        if (StringUtils.isNotBlank(params.time())) {
            expressionAttributeValues.put(":time", new AttributeValue().withS(params.time()));
        }
        if (StringUtils.isNotBlank(params.guests())) {
            expressionAttributeValues.put(":guests", new AttributeValue().withN(params.guests()));
        }

        return expressionAttributeValues;
    }


    private String buildFilterExpression(TableRequestQueryParams params) {
        StringBuilder filterExpressionBuilder = new StringBuilder();

        if (StringUtils.isNotBlank(params.date())) {
            appendCondition(filterExpressionBuilder, "#date = :date");
        }
        if (StringUtils.isNotBlank(params.time()) ) {
            appendCondition(filterExpressionBuilder, "#time > :time");
        }
        if (StringUtils.isNotBlank(params.guests())) {
            appendCondition(filterExpressionBuilder, "guests >= :guests");
        }
        appendCondition(filterExpressionBuilder, "#status = :status");

        return filterExpressionBuilder.toString();
    }

    private void appendCondition(StringBuilder builder, String condition) {
        if (!builder.isEmpty()) {
            builder.append(" AND ");
        }
        builder.append(condition);
    }


    private Map<String, String> createExpressionAttributeNames(TableRequestQueryParams params) {
        Map<String, String> expressionAttributeNames = new HashMap<>();

        if (StringUtils.isNotBlank(params.date())) {
            expressionAttributeNames.put("#date", DATE);
        }
        if (StringUtils.isNotBlank(params.time())) {
            expressionAttributeNames.put("#time", TIME);
        }
        expressionAttributeNames.put("#status", STATUS);

        return expressionAttributeNames;
    }
}

