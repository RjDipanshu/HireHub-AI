package com.hirehub.hirehub_backend.exception;

public class TicketCreationException extends RuntimeException {

    public TicketCreationException(String message) {
        super(message);
    }

    public TicketCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
