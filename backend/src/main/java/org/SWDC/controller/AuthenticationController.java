package org.SWDC.controller;

import org.SWDC.entity.User;
import org.SWDC.repo.UserRepo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final UserRepo userRepo;

    public AuthenticationController(UserRepo userRepo) {

        this.userRepo = userRepo;

    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {

        user.setRole(org.SWDC.entity.Role.USER);
        return userRepo.save(user);

    }

}
