package com.restaurantbackendapp.model;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import java.util.List;

@DynamoDBTable(tableName = "dummy")
@Builder
@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Table {
    @DynamoDBHashKey
    private String tableId;

    @DynamoDBAttribute
    private String locationId;

    @DynamoDBAttribute
    private Integer tableNumber;

    @DynamoDBAttribute
    private Integer guests;

    @DynamoDBAttribute
    private List<String> availableSlots;
}
