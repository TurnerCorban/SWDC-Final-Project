package org.SWDC.controller;

import jakarta.persistence.Id;
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

    @GetMapping
    public List<TicketResponse> all() {

        return ticketService.getAll().stream()
                .map(TicketResponse::from)
                .toList();

    }

    @PutMapping("/{ticketId}/assign/{workerId}")
    public TicketResponse assignWorker(

            @PathVariable Integer ticketId,
            @PathVariable Integer workerId

    ) {

        return TicketResponse.from(ticketService.assignWorker(ticketId, workerId));

    }

    @PutMapping("/{ticketId}/status/{status}")
    public TicketResponse updateStatus(

            @PathVariable Integer ticketId,
            @PathVariable String status

    ) {

        return TicketResponse.from(ticketService.updateStatus(ticketId, status));

    }

}
