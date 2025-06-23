package com.restaurantbackendapp.model;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode

public class User {
    private String cognitoId;
    private String email;
    private String firstName;
    private String lastName;
    private String profileImageUrl;

}
