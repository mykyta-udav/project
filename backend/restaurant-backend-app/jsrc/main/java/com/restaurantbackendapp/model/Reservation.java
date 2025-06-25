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

@DynamoDBTable(tableName = "dummy")
@Builder
@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    @DynamoDBHashKey
    private String id;

    @DynamoDBAttribute
    private String status;

    @DynamoDBAttribute
    private String locationAddress;

    @DynamoDBAttribute
    private String tableId;

    @DynamoDBAttribute
    private String date;

    @DynamoDBAttribute
    private String timeSlot;

    @DynamoDBAttribute
    private String preOrder;

    @DynamoDBAttribute
    private String guestsNumber;

    @DynamoDBAttribute
    private String feedbackId;

//    private String customerId;
//    private String waiterId;
}
