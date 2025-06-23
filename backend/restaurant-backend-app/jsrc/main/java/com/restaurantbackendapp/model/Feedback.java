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
public class Feedback {
    @DynamoDBHashKey
    private String feedbackId;

    @DynamoDBAttribute
    private Double rate;

    @DynamoDBAttribute
    private String comment;

    @DynamoDBAttribute
    private String userName;

    @DynamoDBAttribute
    private String userAvatarUrl;

    @DynamoDBAttribute
    private String date;

    @DynamoDBAttribute
    private String type;

    @DynamoDBAttribute
    private String locationId;

}
