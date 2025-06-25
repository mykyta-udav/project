package com.restaurantbackendapp.model;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;
import com.restaurantbackendapp.model.enums.UserRole;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@DynamoDBTable(tableName = "dummy")
@Builder
public class User {
    @DynamoDBHashKey
    private String cognitoId;
    @DynamoDBAttribute
    private String email;
    @DynamoDBAttribute
    private String firstName;
    @DynamoDBAttribute
    private String lastName;
    @DynamoDBAttribute
    private String profileImageUrl;
    @DynamoDBAttribute
    private UserRole userRole;
}
