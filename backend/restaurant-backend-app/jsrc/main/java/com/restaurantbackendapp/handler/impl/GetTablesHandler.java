package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.QueryRequest;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.EndpointHandler;
import org.apache.commons.lang3.StringUtils;

import javax.inject.Inject;
import javax.inject.Named;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class GetTablesHandler implements EndpointHandler {
    private final AmazonDynamoDB dynamoDbClient;
    private static final String TABLE_NAME = "TABLES_TABLE";
    private final Gson gson;
    private final ObjectMapper objectMapper;


    @Inject
    public GetTablesHandler(@Named("dynamoDbClient") AmazonDynamoDB dynamoDbClient, Gson gson) {
        this.dynamoDbClient = dynamoDbClient;
        this.gson = gson;
        this.objectMapper = new ObjectMapper();

    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {
        try {
            ScanResult scanResponse = getAvailableTables(requestEvent);

            List<Map<String, Object>> tablesList = new ArrayList<>();
            scanResponse.getItems().forEach(item -> {
                Map<String, Object> table = new LinkedHashMap<>();
                table.put("locationId", item.get("locationId").getS());
                table.put("locationAddress", item.get("locationAddress").getS());
                table.put("tableNumber", item.get("tableNumber").getS());
                table.put("capacity", item.get("capacity").getS());
                table.put("availableSlots", item.get("availableSlots").getSS());
                tablesList.add(table);
            });

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(objectMapper.writeValueAsString(tablesList));
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody(e.getMessage());
        }
    }

    private ScanResult getAvailableTables(APIGatewayProxyRequestEvent requestEvent) {
        Map<String, String> queryParams = requestEvent.getQueryStringParameters();
        String locationId = queryParams != null ? queryParams.get("locationId") : null;
        String date = queryParams != null ? queryParams.get("date") : null;
        String time = queryParams != null ? queryParams.get("time") : null;
        String guests = queryParams != null ? queryParams.get("guests") : null;

        if (locationId == null || date == null) {
            throw new IllegalArgumentException("locationId and date are required parameters.");
        }

        // Step 1: Query Reservations Table to find reserved time slots for each table
        QueryRequest reservationsQuery = new QueryRequest()
                .withTableName("ReservationsTable") // Replace with actual Reservations Table name
                .withIndexName("LocationDateIndex")  // Use a GSI if available
                .withKeyConditionExpression("locationId = :locationId AND #date = :date")
                .withExpressionAttributeNames(Map.of("#date", "date"))
                .withExpressionAttributeValues(Map.of(
                        ":locationId", new AttributeValue().withS(locationId),
                        ":date", new AttributeValue().withS(date)
                ));

        QueryResult reservationsResult = dynamoDbClient.query(reservationsQuery);

        // Step 2: Group reservations by tableNumber and reserved time slots
        Map<String, List<String>> reservedSlotsByTable = new HashMap<>();
        reservationsResult.getItems().forEach(item -> {
            String tableNumber = item.get("tableNumber").getS();
            String timeFrom = item.get("timeFrom").getS();
            String timeTo = item.get("timeTo").getS();
            String reservedSlot = timeFrom + "-" + timeTo;

            reservedSlotsByTable.computeIfAbsent(tableNumber, k -> new ArrayList<>())
                    .add(reservedSlot);
        });

        // Step 3: Scan Tables Table for all tables at the location
        ScanRequest scanRequest = new ScanRequest()
                .withTableName(System.getenv(TABLE_NAME))
                .withFilterExpression("locationId = :locationId")
                .withExpressionAttributeValues(Map.of(":locationId", new AttributeValue().withS(locationId)));

        ScanResult scanResponse = dynamoDbClient.scan(scanRequest);

        // Step 4: Filter available time slots for each table
        List<Map<String, Object>> tablesList = new ArrayList<>();
        scanResponse.getItems().forEach(item -> {
            String tableNumber = item.get("tableNumber").getS();
            List<String> availableSlots = new ArrayList<>(item.get("availableSlots").getSS());

            // Exclude reserved time slots
            if (reservedSlotsByTable.containsKey(tableNumber)) {
                List<String> reservedSlots = reservedSlotsByTable.get(tableNumber);
                availableSlots = filterAvailableSlots(availableSlots, reservedSlots);
            }

            // Add table if it has any remaining time slots
            if (!availableSlots.isEmpty()) {
                Map<String, Object> table = new LinkedHashMap<>();
                table.put("locationId", item.get("locationId").getS());
                table.put("tableNumber", tableNumber);
                table.put("capacity", Integer.parseInt(item.get("capacity").getN()));
                table.put("availableSlots", availableSlots);
                tablesList.add(table);
            }
        });

        return scanResponse;
    }

    // Helper method to filter available time slots
    private List<String> filterAvailableSlots(List<String> availableSlots, List<String> reservedSlots) {
        List<String> filteredSlots = new ArrayList<>(availableSlots);
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        for (String reservedSlot : reservedSlots) {
            String[] reservedParts = reservedSlot.split("-");
            LocalTime reservedFrom = LocalTime.parse(reservedParts[0], timeFormatter);
            LocalTime reservedTo = LocalTime.parse(reservedParts[1], timeFormatter);

            filteredSlots.removeIf(slot -> {
                String[] slotParts = slot.split("-");
                LocalTime slotFrom = LocalTime.parse(slotParts[0], timeFormatter);
                LocalTime slotTo = LocalTime.parse(slotParts[1], timeFormatter);

                // Check for overlap between reserved slot and available slot
                return !(reservedTo.isBefore(slotFrom) || reservedFrom.isAfter(slotTo));
            });
        }
        return filteredSlots;
    }
}
