package org.SWDC.responses;

public record RegisterRequest(
        String username,
        String password,
        String phoneNumber,
        String firstName,
        String lastName,
        String email,
        String address
) {
}
