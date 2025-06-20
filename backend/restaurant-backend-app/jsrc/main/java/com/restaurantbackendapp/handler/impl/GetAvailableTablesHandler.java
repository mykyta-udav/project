package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.dto.TableRequestQueryParams;
import com.restaurantbackendapp.exception.InvalidQueryParameterException;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.Table;
import com.restaurantbackendapp.repository.ReservationRepository;
import org.apache.commons.lang3.StringUtils;
import software.amazon.awssdk.annotations.NotNull;
import javax.inject.Inject;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles requests to retrieve available restaurant tables based on specified criteria.
 * This handler interacts with DynamoDB to fetch table availability information and location details.
 * It processes API Gateway requests and returns available tables that match the given parameters.
 */
public class GetAvailableTablesHandler implements EndpointHandler {
    public static final String LOCATION_ID = "locationId";
    public static final String DATE = "date";
    public static final String TIME = "time";
    public static final String GUESTS = "guests";
    public static final String TABLE_NUMBER = "tableNumber";
    public static final String ERROR = "Error: ";
    public static final String RESERVATIONS_TABLE = "RESERVATIONS_TABLE";
    public static final String LOCATIONS_TABLE = "LOCATIONS_TABLE";
    private final ReservationRepository repository;
    private final Gson gson;

    @Inject
    public GetAvailableTablesHandler(ReservationRepository repository, Gson gson) {
        this.repository = repository;
        this.gson = gson;
    }

    /**
     * Handles the API Gateway request to retrieve available tables.
     * Processes the request parameters, queries the database, and returns matching tables.
     *
     * @param requestEvent The API Gateway request event containing query parameters
     * @param context The Lambda execution context
     * @return APIGatewayProxyResponseEvent with status code 200 and available tables on success,
     *         400 for invalid parameters, or 500 for server errors
     */
    @Override
    public APIGatewayProxyResponseEvent handle(@NotNull APIGatewayProxyRequestEvent requestEvent, @NotNull Context context) {
        try {
            TableRequestQueryParams params = extractTableRequestParams(requestEvent);
            QueryResult queryResult = repository.fetchAvailableTables(params, context);
            String locationAddress = repository.fetchLocationAddress(params, context);

            Map<String, Table> tableMap = buildTableAvailabilityMap(queryResult, locationAddress);

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

    /**
     * Extracts and validates request parameters from the API Gateway event.
     *
     * @param requestEvent The API Gateway request event
     * @return TableRequestQueryParams containing validated request parameters
     * @throws InvalidQueryParameterException if required parameters are missing
     */
    private TableRequestQueryParams extractTableRequestParams(APIGatewayProxyRequestEvent requestEvent) {
        Map<String, String> queryParams = requestEvent.getQueryStringParameters();

        validateParameters(queryParams);

        String locationId = queryParams.get(LOCATION_ID);
        String date = queryParams.get(DATE);
        String time = queryParams.get(TIME);
        String guests = queryParams.get(GUESTS);

        return new TableRequestQueryParams(locationId, date, time, guests);
    }

    /**
     * Builds a map of available tables with their details and time slots.
     *
     * @param queryResult The DynamoDB query result containing table information
     * @param locationAddress The address of the restaurant location
     * @return Map of table numbers to Table objects with availability information
     */
    private Map<String, Table> buildTableAvailabilityMap(QueryResult queryResult, String locationAddress) {
        Map<String, Table> tableMap = new HashMap<>();

        queryResult.getItems().forEach(item -> {
            String tableNumber = item.get(TABLE_NUMBER).getS();

            Table table = tableMap.computeIfAbsent(tableNumber,
                    tn -> new Table(
                            item.get(LOCATION_ID).getS(),
                            locationAddress,
                            tableNumber,
                            item.get(GUESTS).getN(),
                            new ArrayList<>()
                    )
            );
            String startTime = item.get(TIME).getS();
            String endTime = LocalTime.parse(startTime, DateTimeFormatter.ISO_LOCAL_TIME)
                            .plusMinutes(90L).toString();
            table.addTimeSlot(String.format("%s-%s", startTime, endTime));
        });
        return tableMap;
    }

    private void validateParameters(Map<String, String> queryParams) {
        if (queryParams == null || queryParams.isEmpty()) {
            throw new InvalidQueryParameterException("Query parameters cannot be null or empty.");
        }

        String locationId = queryParams.get(LOCATION_ID);
        if (StringUtils.isBlank(locationId)) {
            throw new InvalidQueryParameterException("Location ID is required.");
        }

        String date = queryParams.get(DATE);
        if (StringUtils.isNotBlank(date) && !isValidDateFormat(date)) {
            throw new InvalidQueryParameterException("Invalid date format. Expected format: YYYY-MM-DD");
        }

        String time = queryParams.get(TIME);
        if (StringUtils.isNotBlank(time) && !isValidTimeFormat(time)) {
            throw new InvalidQueryParameterException("Invalid time format. Expected format: HH:mm");
        }
    }

    private boolean isValidDateFormat(String date) {
        try {
            LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    private boolean isValidTimeFormat(String time) {
        try {
            LocalTime.parse(time, DateTimeFormatter.ISO_TIME);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

}
