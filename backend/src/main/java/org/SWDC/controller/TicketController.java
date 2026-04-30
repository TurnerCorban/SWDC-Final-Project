package org.SWDC.controller;

import org.SWDC.entity.Ticket;
import org.SWDC.responses.TicketResponse;
import org.SWDC.service.TicketService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {

        this.ticketService = ticketService;

    }

    // Use principal to get current user
    @PostMapping
    public TicketResponse create(@RequestBody Ticket ticket, Principal principal) {

        return TicketResponse.from(ticketService.create(ticket, principal.getName()));

    }

    @GetMapping("/current")
    public List<TicketResponse> mine(Principal principal) {

        return ticketService.getCurrent(principal.getName()).stream()
                .map(TicketResponse::from)
                .toList();
    }

}
