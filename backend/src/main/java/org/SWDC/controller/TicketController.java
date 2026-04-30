package org.SWDC.controller;

import org.SWDC.entity.Ticket;
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
    public Ticket create(@RequestBody Ticket ticket, Principal principal) {

        return ticketService.create(ticket, principal.getName());

    }

    @GetMapping("/current")
    public List<Ticket> mine(Principal principal) {

        return ticketService.getCurrent(principal.getName());

    }

}
