package com.restaurantbackendapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Data
@AllArgsConstructor
@Getter
public class SignInRequestDto {
    private String email;
    private String password;
}
