package org.SWDC.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.SWDC.responses.LoginRequest;
import org.SWDC.responses.RegisterRequest;
import org.SWDC.entity.Role;
import org.SWDC.entity.User;
import org.SWDC.repo.UserRepo;
import org.SWDC.responses.AuthUserResponse;
import org.SWDC.responses.UserSummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationController(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public AuthUserResponse register(@RequestBody RegisterRequest request) {

        User user = new User();
        user.setUsername(request.username());
        user.setPhoneNumber(request.phoneNumber());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setAddress(request.address());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        return AuthUserResponse.from(userRepo.save(user));

    }

    @PostMapping("/login")
    public AuthUserResponse login(@RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        User user = userRepo.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = servletRequest.getSession(true);
        servletRequest.changeSessionId();
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return AuthUserResponse.from(user);
    }

    @GetMapping("/admins")
    public List<UserSummaryResponse> getAdmins() {

        return userRepo.findAll().stream().filter(u -> u.getRole() == Role.ADMIN)
                .map(UserSummaryResponse::from)
                .toList();

    }

}
