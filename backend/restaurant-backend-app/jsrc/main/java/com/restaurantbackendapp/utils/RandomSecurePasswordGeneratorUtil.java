package com.restaurantbackendapp.utils;

import jakarta.inject.Inject;

import java.security.SecureRandom;

public class RandomSecurePasswordGeneratorUtil {
    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String NUMBER = "0123456789";
    private static final String SPECIAL_CHARS = "!@#$%&*()-_=+";
    private static final String PASSWORD_ALLOW_BASE = CHAR_LOWER + CHAR_UPPER + NUMBER + SPECIAL_CHARS;

    private final SecureRandom random;
    @Inject
    public RandomSecurePasswordGeneratorUtil() {
        this.random = new SecureRandom();
    }

    public String generate(int length) {
        if (length < 4) {
            throw new IllegalArgumentException("Password length must be at least 4 characters to include all character types.");
        }

        StringBuilder sb = new StringBuilder(length);

        sb.append(CHAR_LOWER.charAt(random.nextInt(CHAR_LOWER.length())));
        sb.append(CHAR_UPPER.charAt(random.nextInt(CHAR_UPPER.length())));
        sb.append(NUMBER.charAt(random.nextInt(NUMBER.length())));
        sb.append(SPECIAL_CHARS.charAt(random.nextInt(SPECIAL_CHARS.length())));

        for (int i = 4; i < length; i++) {
            int rndCharAt = random.nextInt(PASSWORD_ALLOW_BASE.length());
            sb.append(PASSWORD_ALLOW_BASE.charAt(rndCharAt));
        }

        return sb.toString();
    }
}
