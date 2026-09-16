package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.support.CreateSupportTicketRequest;
import com.hirehub.hirehub_backend.dto.support.SupportTicketResponse;
import com.hirehub.hirehub_backend.service.SupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Support Tickets", description = "User support ticketing system endpoints for issue reporting and status tracking")
@RestController
@RequestMapping("/api/v1/support/tickets")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @Operation(summary = "Create support ticket", description = "Submits a new support inquiry for the authenticated user and assigns a unique ticket ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Support ticket created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failure on subject, description, category, or priority"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT authentication token")
    })
    @PostMapping
    public ResponseEntity<SupportTicketResponse> createTicket(
            @Valid @RequestBody CreateSupportTicketRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        SupportTicketResponse response = supportTicketService.createTicket(request, supabaseUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get my support tickets", description = "Retrieves all support tickets created by the authenticated user ordered by date descending")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of user support tickets returned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT authentication token")
    })
    @GetMapping
    public ResponseEntity<List<SupportTicketResponse>> getMyTickets(
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        List<SupportTicketResponse> tickets = supportTicketService.getMyTickets(supabaseUserId);
        return ResponseEntity.ok(tickets);
    }

    @Operation(summary = "Get support ticket by public ticket ID", description = "Retrieves a single support ticket by its public human-readable reference (e.g. HH-2026-000001)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Support ticket details returned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT authentication token"),
        @ApiResponse(responseCode = "404", description = "Ticket not found or does not belong to authenticated user")
    })
    @GetMapping("/{ticketId}")
    public ResponseEntity<SupportTicketResponse> getMyTicketByTicketId(
            @PathVariable String ticketId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        SupportTicketResponse ticket = supportTicketService.getMyTicketByTicketId(ticketId, supabaseUserId);
        return ResponseEntity.ok(ticket);
    }

    @Operation(summary = "Get ticket messages", description = "Retrieves all messages for a specific support ticket")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Messages returned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    @GetMapping("/{ticketId}/messages")
    public ResponseEntity<List<com.hirehub.hirehub_backend.dto.support.TicketMessageResponse>> getTicketMessages(
            @PathVariable String ticketId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        List<com.hirehub.hirehub_backend.dto.support.TicketMessageResponse> messages = supportTicketService.getMessages(ticketId, supabaseUserId);
        return ResponseEntity.ok(messages);
    }

    @Operation(summary = "Add message to ticket", description = "Adds a new message to an existing support ticket")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Message added successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failure or ticket is closed"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    @PostMapping("/{ticketId}/messages")
    public ResponseEntity<com.hirehub.hirehub_backend.dto.support.TicketMessageResponse> addTicketMessage(
            @PathVariable String ticketId,
            @Valid @RequestBody com.hirehub.hirehub_backend.dto.support.CreateTicketMessageRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        com.hirehub.hirehub_backend.dto.support.TicketMessageResponse message = supportTicketService.addMessage(ticketId, request, supabaseUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
}
