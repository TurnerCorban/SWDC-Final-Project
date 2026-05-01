package org.SWDC.controller;

import org.SWDC.entity.Role;
import org.SWDC.entity.Ticket;
import org.SWDC.entity.User;
import org.SWDC.repo.TicketRepo;
import org.SWDC.repo.UserRepo;
import org.SWDC.responses.TicketResponse;
import org.SWDC.responses.UserSummaryResponse;
import org.SWDC.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final TicketService ticketService;
    private final UserRepo userRepo;
    private final TicketRepo ticketRepo;

    public AdminController(TicketService ticketService, UserRepo userRepo, TicketRepo ticketRepo) {

        this.ticketService = ticketService;
        this.userRepo = userRepo;
        this.ticketRepo = ticketRepo;
    }

    @GetMapping("/tickets")
    public List<TicketResponse> allTickets() {

        return ticketService.getAll().stream()
                .map(TicketResponse::from)
                .toList();

    }

    @GetMapping("/users")
    public List<UserSummaryResponse> getAllUsers() {

        return userRepo.findAll()
                .stream()
                .map(UserSummaryResponse::from)
                .toList();

    }

    @PutMapping("/assign")
    public TicketResponse assign(@RequestParam Integer ticketId, @RequestParam Integer workerId) {

        return TicketResponse.from(ticketService.assignWorker(ticketId, workerId));

    }

    @PutMapping("/users/{userId}/role")
    public UserSummaryResponse updateUserRole(
            @PathVariable Integer userId,
            @RequestBody Role role
    ) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);
        userRepo.save(user);

        return UserSummaryResponse.from(user);
    }

    @DeleteMapping("/users/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteUser(@PathVariable Integer userId, Authentication authentication) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (authentication != null && user.getUsername().equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete the signed-in admin");
        }

        for (Ticket ticket : ticketRepo.findByUser(user)) {
            ticket.setUser(null);
        }

        for (Ticket ticket : ticketRepo.findByWorker(user)) {
            ticket.setWorker(null);
        }

        userRepo.delete(user);
    }

}
