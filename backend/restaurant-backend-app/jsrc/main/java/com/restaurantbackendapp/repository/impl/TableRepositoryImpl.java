package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.lambda.runtime.Context;
import com.restaurantbackendapp.exception.TableNotFoundException;
import com.restaurantbackendapp.model.Table;
import com.restaurantbackendapp.repository.TableRepository;
import javax.inject.Inject;
import java.util.List;
import java.util.Map;

public class TableRepositoryImpl implements TableRepository {
    public static final String TABLES_TABLE = "TABLES_TABLE";
    public static final String LOCATION_INDEX = "LocationIndex";
    private final DynamoDBMapper dynamoDBMapper;

    @Inject
    public TableRepositoryImpl(AmazonDynamoDB dynamoDbClient) {
        this.dynamoDBMapper = new DynamoDBMapper(
                dynamoDbClient,
                DynamoDBMapperConfig.builder()
                        .withTableNameOverride(DynamoDBMapperConfig.TableNameOverride.withTableNameReplacement(
                                System.getenv(TABLES_TABLE)))
                        .withConsistentReads(DynamoDBMapperConfig.ConsistentReads.EVENTUAL)
                        .build());
    }
    @Override
    public List<Table> findAllTablesByLocationId(String locationId) {
        DynamoDBQueryExpression<Table> queryExpression = new DynamoDBQueryExpression<Table>()
                .withIndexName(LOCATION_INDEX)
                .withKeyConditionExpression("#locationId = :locationId")
                .withExpressionAttributeNames(Map.of("#locationId", "locationId"))
                .withExpressionAttributeValues(Map.of(":locationId", new AttributeValue().withS(locationId)))
                .withConsistentRead(false);

        List<Table> tables = dynamoDBMapper.query(Table.class, queryExpression);

        if (tables.isEmpty()) {
            throw new TableNotFoundException("No available tables found for the given criteria.");
        }
        return tables;
    }


}
