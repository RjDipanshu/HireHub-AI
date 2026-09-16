package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.support.CreateTicketMessageRequest;
import com.hirehub.hirehub_backend.dto.support.SupportTicketResponse;
import com.hirehub.hirehub_backend.dto.support.TicketMessageResponse;
import com.hirehub.hirehub_backend.dto.support.UpdateTicketPriorityRequest;
import com.hirehub.hirehub_backend.dto.support.UpdateTicketStatusRequest;
import com.hirehub.hirehub_backend.enums.TicketCategory;
import com.hirehub.hirehub_backend.enums.TicketPriority;
import com.hirehub.hirehub_backend.enums.TicketStatus;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Admin Support Tickets", description = "Admin endpoints for managing user support tickets")
@RestController
@RequestMapping("/api/v1/admin/support/tickets")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupportTicketController {

    private final SupportTicketService supportTicketService;

    @Operation(summary = "List all support tickets", description = "Retrieves all support tickets across the system with optional filters")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of tickets returned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires ADMIN role")
    })
    @GetMapping
    public ResponseEntity<List<SupportTicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) String search) {
        List<SupportTicketResponse> tickets = supportTicketService.getAllTicketsAdmin(status, priority, category, search);
        return ResponseEntity.ok(tickets);
    }

    @Operation(summary = "Get ticket details", description = "Retrieves details of any specific support ticket")
    @GetMapping("/{ticketId}")
    public ResponseEntity<SupportTicketResponse> getTicketById(@PathVariable String ticketId) {
        SupportTicketResponse ticket = supportTicketService.getTicketByTicketIdAdmin(ticketId);
        return ResponseEntity.ok(ticket);
    }

    @Operation(summary = "Get ticket messages", description = "Retrieves all messages for a specific support ticket")
    @GetMapping("/{ticketId}/messages")
    public ResponseEntity<List<TicketMessageResponse>> getTicketMessages(@PathVariable String ticketId) {
        List<TicketMessageResponse> messages = supportTicketService.getMessagesAdmin(ticketId);
        return ResponseEntity.ok(messages);
    }

    @Operation(summary = "Add admin reply", description = "Adds an admin reply to a support ticket")
    @PostMapping("/{ticketId}/messages")
    public ResponseEntity<TicketMessageResponse> addAdminMessage(
            @PathVariable String ticketId,
            @Valid @RequestBody CreateTicketMessageRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID adminSupabaseUserId = UUID.fromString(jwt.getSubject());
        TicketMessageResponse message = supportTicketService.addAdminMessage(ticketId, request, adminSupabaseUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @Operation(summary = "Update ticket status", description = "Updates the status of a support ticket")
    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<SupportTicketResponse> updateTicketStatus(
            @PathVariable String ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        SupportTicketResponse ticket = supportTicketService.updateTicketStatusAdmin(ticketId, request.getStatus());
        return ResponseEntity.ok(ticket);
    }

    @Operation(summary = "Update ticket priority", description = "Updates the priority of a support ticket")
    @PatchMapping("/{ticketId}/priority")
    public ResponseEntity<SupportTicketResponse> updateTicketPriority(
            @PathVariable String ticketId,
            @Valid @RequestBody UpdateTicketPriorityRequest request) {
        SupportTicketResponse ticket = supportTicketService.updateTicketPriorityAdmin(ticketId, request.getPriority());
        return ResponseEntity.ok(ticket);
    }
}
