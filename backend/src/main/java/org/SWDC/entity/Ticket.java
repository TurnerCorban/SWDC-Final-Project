package org.SWDC.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
@Entity
@Table(name = "tickets")

public class Ticket {

    @Id @GeneratedValue
    private Integer id;

    // Ticket data
    private String location;
    private String description;

    @ManyToOne
    private User user;

    @ManyToOne
    private User worker;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    private LocalDateTime timeSubmitted =  LocalDateTime.now();
    private LocalDateTime timeCompleted;

    // Getters / Setters
    public Integer getId() {
        return id;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }

    public User getWorker() {
        return worker;
    }
    public void setWorker(User worker) {
        this.worker = worker;
    }

    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getTimeSubmitted() {
        return timeSubmitted;
    }
    public void setTimeSubmitted(LocalDateTime timeSubmitted) {
        this.timeSubmitted = timeSubmitted;
    }

    public LocalDateTime getTimeCompleted() {
        return timeCompleted;
    }
    public void setTimeCompleted(LocalDateTime timeCompleted) {
        this.timeCompleted = timeCompleted;
    }
}
