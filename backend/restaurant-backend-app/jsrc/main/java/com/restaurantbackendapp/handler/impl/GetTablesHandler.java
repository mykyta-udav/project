package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.restaurantbackendapp.handler.EndpointHandler;
import javax.inject.Inject;
import javax.inject.Named;

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
    public APIGatewayProxyResponseEvent handle(APIGatewayV2HTTPEvent requestEvent, Context context) {
        try {
//            Map<String, String> queryParams = requestEvent.getQueryStringParameters();
//            String locationId = queryParams != null ? queryParams.get("locationId") : null;
//            String date = queryParams != null ? queryParams.get("date") : null;
//            String timeSlot = queryParams != null ? queryParams.get("time") : null;
//            String guests = queryParams != null ? queryParams.get("guests") : null;
//
//            if (locationId == null || date == null) {
//                throw new IllegalArgumentException("locationId and date are required parameters.");
//            }

//            List<Map<String, Object>> tablesList = new ArrayList<>();
//            scanResponse.getItems().forEach(item -> {
//                Map<String, Object> table = new LinkedHashMap<>();
//                table.put("locationId", item.get("locationId").getS());
//                table.put("locationAddress", item.get("locationAddress").getS());
//                table.put("tableNumber", item.get("tableNumber").getS());
//                table.put("capacity", item.get("capacity").getS());
//                table.put("availableSlots", item.get("availableSlots").getSS());
//                tablesList.add(table);
//            });

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody("body");
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody(e.getMessage());
        }
    }
}
