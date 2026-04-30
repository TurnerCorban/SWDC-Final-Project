package org.SWDC.responses;

import org.SWDC.entity.User;

public record AuthUserResponse(
        Integer id,
        String username,
        String role
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name()
        );
    }
}
