package org.SWDC.controller;

import org.SWDC.entity.Ticket;
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
    public List<Ticket> allTickets() {

        return ticketService.getAll();

    }

    @PutMapping("/assign")
    public Ticket assign(@RequestParam Integer ticketId, @RequestParam Integer workerId) {

        return ticketService.assignWorker(ticketId, workerId);

    }

}
