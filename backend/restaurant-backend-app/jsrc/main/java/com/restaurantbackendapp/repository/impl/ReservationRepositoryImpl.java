package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.lambda.runtime.Context;
import com.restaurantbackendapp.dto.request.TableRequestQueryParams;
import com.restaurantbackendapp.model.Reservation;
import com.restaurantbackendapp.repository.ReservationRepository;
import org.apache.commons.lang3.StringUtils;
import javax.inject.Named;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReservationRepositoryImpl implements ReservationRepository {
    public static final String AVAILABLE = "AVAILABLE";
    public static final String DB_CLIENT = "dynamoDbClient";
    public static final String TIME = "time";
    public static final String ERROR = "Error: ";
    public static final String DATE = "date";
    public static final String LOCATION_INDEX = "LocationIndex";
    private final AmazonDynamoDB dynamoDbClient;
    private final DynamoDBMapper dynamoDBMapper;
    public static final String RESERVATIONS_TABLE = "RESERVATIONS_TABLE";

    public ReservationRepositoryImpl(@Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.dynamoDBMapper = new DynamoDBMapper(
                dynamoDbClient,
                DynamoDBMapperConfig.builder()
                        .withTableNameOverride(DynamoDBMapperConfig.TableNameOverride.withTableNameReplacement(
                                System.getenv(RESERVATIONS_TABLE)))
                        .build());
    }

    @Override
    public void createReservation(Reservation reservation) {

    }

    @Override
    public List<Reservation> fetchAllReservationsByTablesIds(List<String> tableIds, TableRequestQueryParams params, Context context) {
        List<Reservation> reservations = new ArrayList<>();

        for (String tableId : tableIds) {
            DynamoDBQueryExpression<Reservation> queryExpression = new DynamoDBQueryExpression<Reservation>()
                    .withIndexName("ReservationsByTableIdsIndex")
                    .withKeyConditionExpression(createKeyConditionExpression(params))
                    .withExpressionAttributeNames(createExpressionAttributeNames(params))
                    .withExpressionAttributeValues(createExpressionAttributeValues(params, tableId))
                    .withConsistentRead(false);

            List<Reservation> queryResult = dynamoDBMapper.query(Reservation.class, queryExpression);
            reservations.addAll(queryResult);
        }

        context.getLogger().log(String.format("Reservations count: %d", reservations.size()));
        return  reservations;
    }

    private String createKeyConditionExpression(TableRequestQueryParams params) {
        StringBuilder builder = new StringBuilder();
        builder.append("#tableId = :tableId");

        if (StringUtils.isNotBlank(params.date())) {
            builder.append(" AND #date = :date");
        }

        return builder.toString();
    }

    private Map<String, AttributeValue> createExpressionAttributeValues(TableRequestQueryParams params, String tableId) {
        Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();

        expressionAttributeValues.put(":tableId", new AttributeValue().withS(tableId));

        if (StringUtils.isNotBlank(params.date())) {
            expressionAttributeValues.put(":date", new AttributeValue().withS(params.date()));
        }

        return expressionAttributeValues;
    }

    private Map<String, String> createExpressionAttributeNames(TableRequestQueryParams params) {
        Map<String, String> expressionAttributeNames = new HashMap<>();
        expressionAttributeNames.put("#tableId", "tableId");

        if (StringUtils.isNotBlank(params.date())) {
            expressionAttributeNames.put("#date", DATE);
        }

        return expressionAttributeNames;
    }
}

