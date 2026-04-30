package org.SWDC.config;

import org.SWDC.entity.Role;
import org.SWDC.entity.User;
import org.SWDC.repo.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DefaultAdminSeeder implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPassword;

    public DefaultAdminSeeder(
            UserRepo userRepo,
            PasswordEncoder passwordEncoder,
            @Value("${app.default-admin.username}") String adminUsername,
            @Value("${app.default-admin.password}") String adminPassword
    ) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (userRepo.findByUsername(adminUsername).isPresent()) {
            return;
        }

        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);

        userRepo.save(admin);
    }
}
