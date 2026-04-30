package org.SWDC.service;

import org.SWDC.entity.Status;
import org.SWDC.entity.Ticket;
import org.SWDC.entity.User;
import org.SWDC.repo.TicketRepo;
import org.SWDC.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class TicketService {

    private final TicketRepo ticketRepo;
    private final UserRepo userRepo;

    public TicketService(TicketRepo ticketRepo, UserRepo userRepo) {

        this.ticketRepo = ticketRepo;
        this.userRepo = userRepo;

    }

    // Creates a ticket
    public Ticket create(Ticket ticket, String username) {

        User user = userRepo.findByUsername(username).orElseThrow();
        ticket.setUser(user);
        ticket.setStatus(Status.PENDING);
        return ticketRepo.save(ticket);

    }

    // Retrieves data for current logged-in user's tickets
    public List<Ticket> getCurrent(String username) {

        User user = userRepo.findByUsername(username).orElseThrow();
        return ticketRepo.findByUser(user);

    }

    // Retrieves data for all tickets in the list
    public List<Ticket> getAll() {

        return ticketRepo.findAll();

    }

    // Assigns a worker user entity to a given ticket
    public Ticket assignWorker(Integer ticketId, Integer workerId) {

        Ticket ticket = ticketRepo.findById(ticketId).orElseThrow();
        User worker = userRepo.findById(workerId).orElseThrow();

        ticket.setWorker(worker);
        return ticketRepo.save(ticket);

    }

}
