package com.restaurantbackendapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SignInResponseDto {
    private String accessToken;
    private String username;
    private String role;
}
