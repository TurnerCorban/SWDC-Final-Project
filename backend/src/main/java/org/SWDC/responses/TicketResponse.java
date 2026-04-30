package org.SWDC.responses;

import org.SWDC.entity.Ticket;

import java.time.LocalDateTime;

public record TicketResponse(
        Integer id,
        String location,
        String description,
        UserSummaryResponse user,
        UserSummaryResponse worker,
        String status,
        LocalDateTime timeSubmitted,
        LocalDateTime timeCompleted
) {
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getLocation(),
                ticket.getDescription(),
                UserSummaryResponse.from(ticket.getUser()),
                UserSummaryResponse.from(ticket.getWorker()),
                ticket.getStatus().name(),
                ticket.getTimeSubmitted(),
                ticket.getTimeCompleted()
        );
    }
}
