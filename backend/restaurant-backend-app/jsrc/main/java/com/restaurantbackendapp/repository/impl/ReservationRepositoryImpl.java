package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.*;
import com.amazonaws.services.lambda.runtime.Context;
import com.restaurantbackendapp.dto.TableRequestQueryParams;
import com.restaurantbackendapp.model.Reservation;

import com.restaurantbackendapp.repository.ReservationRepository;
import org.apache.commons.lang3.StringUtils;
import javax.inject.Named;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

import static com.restaurantbackendapp.handler.impl.GetAvailableTablesHandler.GUESTS;
import static com.restaurantbackendapp.handler.impl.GetAvailableTablesHandler.TABLE_NUMBER;

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
    public static final String CONFIRMED = "CONFIRMED";
    public static final String RESERVATION_ID = "reservationId";
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");


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

    @Override
    public boolean isTableAvailable(String locationId, String tableNumber, String date, String timeFrom, String timeTo, Context context) {
        context.getLogger().log(String.format("Checking table availability - Location: %s, Table: %s, Date: %s, Time: %s-%s",
                locationId, tableNumber, date, timeFrom, timeTo));

        try {
            LocalTime requestedStartTime = LocalTime.parse(timeFrom, TIME_FORMATTER);
            LocalTime requestedEndTime = LocalTime.parse(timeTo, TIME_FORMATTER);

            QueryRequest queryRequest = new QueryRequest()
                    .withTableName(System.getenv(RESERVATIONS_TABLE))
                    .withIndexName("LocationDateIndex")
                    .withKeyConditionExpression("locationId = :locationId")
                    .withFilterExpression("#date = :date AND tableNumber = :tableNumber AND #status = :status")
                    .withExpressionAttributeNames(Map.of(
                            "#date", DATE,
                            "#status", STATUS
                    ))
                    .withExpressionAttributeValues(Map.of(
                            ":locationId", new AttributeValue().withS(locationId),
                            ":date", new AttributeValue().withS(date),
                            ":tableNumber", new AttributeValue().withS(tableNumber),
                            ":status", new AttributeValue().withS(CONFIRMED)
                    ));

            QueryResult result = dynamoDbClient.query(queryRequest);
            List<Map<String, AttributeValue>> existingReservations = result.getItems();

            context.getLogger().log(String.format("Found %d existing reservations for table %s on %s",
                    existingReservations.size(), tableNumber, date));

            for (Map<String, AttributeValue> reservation : existingReservations) {
                AttributeValue timeAttr = reservation.get(TIME);
                if (timeAttr != null && StringUtils.isNotBlank(timeAttr.getS())) {
                    LocalTime existingStartTime = LocalTime.parse(timeAttr.getS(), TIME_FORMATTER);
                    //  90 minutes duration for existing reservations
                    LocalTime existingEndTime = existingStartTime.plusMinutes(90);

                    //  if times overlap
                    boolean hasConflict = !(requestedEndTime.isBefore(existingStartTime) || requestedStartTime.isAfter(existingEndTime));

                    if (hasConflict) {
                        context.getLogger().log(String.format("Time conflict found: requested %s-%s overlaps with existing %s-%s",
                                requestedStartTime, requestedEndTime, existingStartTime, existingEndTime));
                        return false;
                    }
                }
            }

            context.getLogger().log("Table is available - no conflicts found");
            return true;

        } catch (Exception e) {
            context.getLogger().log(ERROR + "Failed to check table availability: " + e.getMessage());
            throw new AmazonDynamoDBException("Failed to check table availability: " + e.getMessage());
        }
    }

    @Override
    public void createReservation(Reservation reservation, Context context) {
        context.getLogger().log("Creating reservation: " + reservation.getReservationId());

        try {
            Map<String, AttributeValue> item = new HashMap<>();
            item.put(RESERVATION_ID, new AttributeValue().withS(reservation.getReservationId()));
            item.put(LOCATION_ID, new AttributeValue().withS(reservation.getLocationId()));
            item.put(TABLE_NUMBER, new AttributeValue().withS(reservation.getTableNumber()));
            item.put(DATE, new AttributeValue().withS(reservation.getDate()));
            item.put(TIME, new AttributeValue().withS(reservation.getTime()));
            item.put(GUESTS, new AttributeValue().withN(reservation.getGuests().toString()));
            item.put(STATUS, new AttributeValue().withS(reservation.getStatus()));


            if (StringUtils.isNotBlank(reservation.getCustomerId())) {
                item.put("customerId", new AttributeValue().withS(reservation.getCustomerId()));
            }
            if (StringUtils.isNotBlank(reservation.getAssignedWaiterId())) {
                item.put("assignedWaiterId", new AttributeValue().withS(reservation.getAssignedWaiterId()));
            }

            PutItemRequest putItemRequest = new PutItemRequest()
                    .withTableName(System.getenv(RESERVATIONS_TABLE))
                    .withItem(item)
                    .withConditionExpression("attribute_not_exists(reservationId)"); // Prevent duplicate reservations

            dynamoDbClient.putItem(putItemRequest);
            context.getLogger().log("Reservation created successfully: " + reservation.getReservationId());

        } catch (ConditionalCheckFailedException e) {
            context.getLogger().log(ERROR + "Reservation already exists: " + reservation.getReservationId());
            throw new AmazonDynamoDBException("Reservation with this ID already exists");
        } catch (Exception e) {
            context.getLogger().log(ERROR + "Failed to create reservation: " + e.getMessage());
            throw new AmazonDynamoDBException("Failed to create reservation: " + e.getMessage());
        }
    }

    @Override
    public String fetchLocationAddressById(String locationId, Context context) {
        String tableName = System.getenv(LOCATIONS_TABLE);
        context.getLogger().log(String.format("Fetching from locations table: %s for locationId: %s", tableName, locationId));

        GetItemRequest getItemRequest = new GetItemRequest()
                .withTableName(tableName)
                .withKey(Map.of(
                        LOCATION_ID, new AttributeValue().withS(locationId)
                ));
        try {
            GetItemResult getItemResult = dynamoDbClient.getItem(getItemRequest);
            if (getItemResult.getItem() == null || getItemResult.getItem().isEmpty()) {
                context.getLogger().log("Location not found for locationId: " + locationId);
                return "Location not found";
            }

            AttributeValue addressAttribute = getItemResult.getItem().get(ADDRESS);
            if (addressAttribute == null) {
                context.getLogger().log("Address attribute not found for locationId: " + locationId);
                return "Address not available";
            }

            return addressAttribute.getS();
        } catch (Exception e) {
            context.getLogger().log(ERROR + "Failed to fetch location address: " + e.getMessage());
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
            filterExpressionBuilder.append("#date = :date") ;
        }
        if (StringUtils.isNotBlank(params.time()) ) {
            appendCondition(filterExpressionBuilder, "#time > :time");
        }
        if (StringUtils.isNotBlank(params.guests())) {
            appendCondition(filterExpressionBuilder, "guests >= :guests");
        }

        if (filterExpressionBuilder.isEmpty()) {
            filterExpressionBuilder.append("#status = :status");
        } else {
            appendCondition(filterExpressionBuilder, "#status = :status");
        }
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

