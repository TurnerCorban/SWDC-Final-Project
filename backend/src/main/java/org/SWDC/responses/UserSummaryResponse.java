package org.SWDC.responses;

import org.SWDC.entity.User;

public record UserSummaryResponse(
        Integer id,
        String username,
        String firstName,
        String lastName,
        String email,
        String role
) {
    public static UserSummaryResponse from(User user) {
        if (user == null) {
            return null;
        }

        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
