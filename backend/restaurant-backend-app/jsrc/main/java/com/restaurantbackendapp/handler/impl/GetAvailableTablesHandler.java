package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.dto.TableRequestQueryParams;
import com.restaurantbackendapp.exception.InvalidQueryParameterException;
import com.restaurantbackendapp.exception.LocationNotFoundException;
import com.restaurantbackendapp.exception.TableNotFoundException;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.Table;
import com.restaurantbackendapp.repository.LocationRepository;
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
import java.util.List;
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
    public static final String ERROR = "Error ";
    public static final String RESERVATIONS_TABLE = "RESERVATIONS_TABLE";
    public static final String LOCATIONS_TABLE = "LOCATIONS_TABLE";
    public static final String MESSAGE = "Message";
    public static final String INTERNAL_SERVER_ERROR = "Internal Server Error";
    public static final String INVALID_QUERY_PARAMETERS = "Invalid query parameters";
    public static final String RESTAURANT_NOT_FOUND = "Restaurant Not Found";
    private final ReservationRepository resRepo;
    private final LocationRepository locRepo;
    private final Gson gson;

    @Inject
    public GetAvailableTablesHandler(ReservationRepository resRepo, Gson gson, LocationRepository locRepo) {
        this.resRepo = resRepo;
        this.gson = gson;
        this.locRepo = locRepo;
    }

    /**
     * Handles the API Gateway request to retrieve available tables.
     * Processes the request parameters, queries the database, and returns matching tables.
     *
     * @param requestEvent The API Gateway request event containing query parameters
     * @param context The Lambda execution context
     * @return APIGatewayProxyResponseEvent with status code 200 and available tables on success,
     *         400 for invalid parameters, 404 if a location is not found, or 500 for server errors
     */
    @Override
    public APIGatewayProxyResponseEvent handle(@NotNull APIGatewayProxyRequestEvent requestEvent, @NotNull Context context) {
        try {
            TableRequestQueryParams params = extractTableRequestParams(requestEvent);
            QueryResult queryResult = resRepo.fetchAvailableTables(params, context);

            if (queryResult.getCount() == 0) {
               throw new TableNotFoundException(INVALID_QUERY_PARAMETERS);
            }

            String locationAddress = locRepo.fetchLocationAddress(params, context);
            Map<String, Table> tableMap = buildTableAvailabilityMap(queryResult, locationAddress);

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(tableMap.values()));

        } catch (InvalidQueryParameterException e) {
            context.getLogger().log(ERROR + e.getMessage());
            return response(400, INVALID_QUERY_PARAMETERS, e);
        } catch (LocationNotFoundException | TableNotFoundException e) {
            context.getLogger().log(ERROR + e.getMessage());//
            return response(404, RESTAURANT_NOT_FOUND, e);
        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            return response(500, INTERNAL_SERVER_ERROR, e);
        }
    }

    private APIGatewayProxyResponseEvent response(int statusCode, String message, Throwable e) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withBody(gson.toJson(Map.of(
                        ERROR, message,
                        MESSAGE, e.getMessage())));
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

    private Map<String, Table> buildTableAvailabilityMap(QueryResult queryResult, String locationAddress) {
        Map<String, Table> tableMap = new HashMap<>();

        List<Map<String, AttributeValue>> items = queryResult.getItems();
        if (items == null || items.isEmpty()) {
            return tableMap;
        }

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
