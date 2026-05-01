package org.SWDC.controller;

import org.SWDC.entity.Role;
import org.SWDC.entity.User;
import org.SWDC.repo.UserRepo;
import org.SWDC.responses.TicketResponse;
import org.SWDC.responses.UserSummaryResponse;
import org.SWDC.service.TicketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final TicketService ticketService;
    private final UserRepo userRepo;

    public AdminController(TicketService ticketService, UserRepo userRepo) {

        this.ticketService = ticketService;
        this.userRepo = userRepo;
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

}
