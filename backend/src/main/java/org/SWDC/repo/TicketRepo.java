package org.SWDC.repo;

import org.SWDC.entity.Ticket;
import org.SWDC.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface TicketRepo extends JpaRepository<Ticket,Integer> {

    List<Ticket> findByUser(User user);

}
