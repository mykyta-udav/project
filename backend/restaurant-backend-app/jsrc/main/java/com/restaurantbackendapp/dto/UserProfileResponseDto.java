package com.restaurantbackendapp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponseDto {
    private String firstName;
    private String lastName;
    private String role;
    private String email;
    private String imageUrl;
}
