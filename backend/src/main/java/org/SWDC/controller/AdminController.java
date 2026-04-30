package org.SWDC.controller;

import org.SWDC.responses.TicketResponse;
import org.SWDC.service.TicketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final TicketService ticketService;

    public AdminController(TicketService ticketService) {

        this.ticketService = ticketService;

    }

    @GetMapping("/tickets")
    public List<TicketResponse> allTickets() {

        return ticketService.getAll().stream()
                .map(TicketResponse::from)
                .toList();

    }

    @PutMapping("/assign")
    public TicketResponse assign(@RequestParam Integer ticketId, @RequestParam Integer workerId) {

        return TicketResponse.from(ticketService.assignWorker(ticketId, workerId));

    }

}
