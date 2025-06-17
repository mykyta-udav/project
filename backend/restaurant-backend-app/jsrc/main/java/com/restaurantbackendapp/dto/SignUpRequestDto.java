package com.restaurantbackendapp.dto;

import lombok.Data;
import lombok.experimental.FieldDefaults;

import static lombok.AccessLevel.PRIVATE;

@Data
@FieldDefaults(level = PRIVATE)
public class SignUpRequestDto {
    String firstName;
    String lastName;
    String email;
    String password;
}