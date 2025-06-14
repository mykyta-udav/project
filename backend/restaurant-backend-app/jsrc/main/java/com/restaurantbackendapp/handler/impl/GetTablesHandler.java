package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.AmazonDynamoDBException;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.GetItemRequest;
import com.amazonaws.services.dynamodbv2.model.GetItemResult;
import com.amazonaws.services.dynamodbv2.model.QueryRequest;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.dto.TableQueryParams;
import com.restaurantbackendapp.exception.InvalidQueryParameterException;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.Table;
import javax.inject.Inject;
import javax.inject.Named;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class GetTablesHandler implements EndpointHandler {
    public static final String LOCATION_ID = "locationId";
    public static final String DATE = "date";
    public static final String TIME = "time";
    public static final String GUESTS = "guests";
    public static final String TABLE_NUMBER = "tableNumber";
    public static final String TIME_SLOT = "timeSlot";
    public static final String AVAILABLE = "AVAILABLE";
    public static final String ADDRESS = "locationAddress";
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String ERROR = "Error: ";
    public static final String STATUS = "status";
    private final AmazonDynamoDB dynamoDbClient;
    public static final String RESERVATIONS_TABLE = "RESERVATIONS_TABLE";
    public static final String LOCATIONS_TABLE = "LOCATIONS_TABLE";
    private final Gson gson;

    @Inject
    public GetTablesHandler(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient, Gson gson) {
        this.dynamoDbClient = dynamoDbClient;
        this.gson = gson;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {
        try {
            TableQueryParams tableQueryParams = getTableQueryParams(requestEvent);
            QueryResult queryResult = fetchAvailableTables(tableQueryParams, context);
            String locationAddress = fetchLocationAddress(tableQueryParams, context);

            Map<String, Table> tableMap = buildTableAvailabilityMap(queryResult, locationAddress, context);

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(tableMap.values()));

        } catch (InvalidQueryParameterException e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody(e.getMessage());
        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(e.getMessage());
        }
    }

    private TableQueryParams getTableQueryParams(APIGatewayProxyRequestEvent requestEvent) {
        Map<String, String> queryParams = requestEvent.getQueryStringParameters();
        String locationId = queryParams != null ? queryParams.get(LOCATION_ID) : null;
        String date = queryParams != null ? queryParams.get(DATE) : null;
        String timeSlot = queryParams != null ? queryParams.get(TIME) : null;
        String guests = queryParams != null ? queryParams.getOrDefault(GUESTS, "2") : null;

        if (locationId == null || date == null) {
            throw new InvalidQueryParameterException("locationId and date are required parameters.");
        }

        return new TableQueryParams(locationId, date, timeSlot, guests);
    }



    private Map<String, Table> buildTableAvailabilityMap(QueryResult queryResult, String locationAddress, Context context) {
        Map<String, Table> tableMap = new HashMap<>();

        queryResult.getItems().forEach(item -> {
            String tableNumber = item.get(TABLE_NUMBER).getS();
            context.getLogger().log("Table number: " + tableNumber);
            Table table = tableMap.computeIfAbsent(tableNumber,
                    tn -> new Table(
                            item.get(LOCATION_ID).getS(),
                            locationAddress,
                            tableNumber,
                            item.get(GUESTS).getN(),
                            new ArrayList<>()
                    )
            );
            table.addTimeSlot(item.get(TIME_SLOT).getS());
        });
        return tableMap;
    }

    private QueryResult fetchAvailableTables(TableQueryParams params, Context context) {
        String filterExpression =
                "timeSlot = :timeSlot" +
                " AND guests >= :guests" +
                " AND #status = :status";

        QueryRequest queryRequest = new QueryRequest()
                .withTableName(System.getenv(RESERVATIONS_TABLE))
                .withIndexName("LocationDateIndex")
                .withKeyConditionExpression("locationId = :locationId AND #date = :date")
                .withFilterExpression(filterExpression)
                .withExpressionAttributeNames(Map.of(
                        "#date", DATE,// Alias the reserved keyword `date`
                        "#status", STATUS
                ))
                .withExpressionAttributeValues(Map.of(
                        ":locationId", new AttributeValue().withS(params.getLocationId()),
                        ":date", new AttributeValue().withS(params.getDate()),
                        ":timeSlot", new AttributeValue().withS(params.getTimeSlot()),
                        ":guests", new AttributeValue().withN(params.getGuests()),
                        ":status", new AttributeValue().withS(AVAILABLE)
                ));
        try {
            QueryResult result = dynamoDbClient.query(queryRequest);
            context.getLogger().log(String.format("Query successful, items count: %s", result.getCount()));
            return result;
        } catch (Exception e) {
            context.getLogger().log("Failed to execute DynamoDB query" + e.getMessage());
            throw new AmazonDynamoDBException("Failed to query Reservations table: " + e.getMessage());
        }
    }

    private String fetchLocationAddress(TableQueryParams tableQueryParams, Context context) {
        String tableName = System.getenv(LOCATIONS_TABLE);
        context.getLogger().log(String.format("Fetching from locations table: %s", tableName));

        GetItemRequest getItemRequest = new GetItemRequest()
                .withTableName(System.getenv(LOCATIONS_TABLE))
                .withKey(Map.of(
                        LOCATION_ID, new AttributeValue().withS(tableQueryParams.getLocationId())
                ));
        try {
            GetItemResult getItemResult = dynamoDbClient.getItem(getItemRequest);
            return getItemResult.getItem().get(ADDRESS).getS();
        } catch (Exception e) {
            throw new AmazonDynamoDBException("Failed to query Locations table: " + e.getMessage());
        }

    }
}
