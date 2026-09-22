package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.support.CreateSupportTicketRequest;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.TicketCategory;
import com.hirehub.hirehub_backend.enums.TicketPriority;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.service.SupportTicketService;
import com.hirehub.hirehub_backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Year;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SupportTicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private SupportTicketService supportTicketService;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID user1SupabaseId;
    private UUID user2SupabaseId;

    @BeforeEach
    void setUp() {
        user1SupabaseId = UUID.randomUUID();
        user2SupabaseId = UUID.randomUUID();

        // 1. Create primary test user
        UserRequestDTO u1 = new UserRequestDTO();
        u1.setSupabaseUserId(user1SupabaseId);
        u1.setFirstName("Alice");
        u1.setLastName("Candidate");
        u1.setEmail("alice." + user1SupabaseId.toString().substring(0, 8) + "@hirehub.ai");
        u1.setRole(RoleType.CANDIDATE);
        u1.setStatus(UserStatus.ACTIVE);
        u1.setEmailVerified(true);
        userService.createUser(u1);

        // 2. Create secondary test user (for cross-user authorization tests)
        UserRequestDTO u2 = new UserRequestDTO();
        u2.setSupabaseUserId(user2SupabaseId);
        u2.setFirstName("Bob");
        u2.setLastName("Recruiter");
        u2.setEmail("bob." + user2SupabaseId.toString().substring(0, 8) + "@hirehub.ai");
        u2.setRole(RoleType.RECRUITER);
        u2.setStatus(UserStatus.ACTIVE);
        u2.setEmailVerified(true);
        userService.createUser(u2);
    }

    @Test
    @DisplayName("POST /api/v1/support/tickets - Unauthenticated request is rejected with 401 Unauthorized")
    void testCreateTicket_Unauthenticated_ShouldReturn401() throws Exception {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Unable to access interviews page")
                .description("Getting 404 whenever I click on candidate interviews schedule.")
                .category(TicketCategory.TECHNICAL)
                .priority(TicketPriority.HIGH)
                .build();

        mockMvc.perform(post("/api/v1/support/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/support/tickets - Authenticated user can create ticket & ticket ID format is HH-YYYY-XXXXXX")
    void testCreateTicket_Authenticated_ShouldCreateAndReturn201() throws Exception {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Unable to access interviews page")
                .description("Getting 404 whenever I click on candidate interviews schedule.")
                .category(TicketCategory.TECHNICAL)
                .priority(TicketPriority.HIGH)
                .build();

        int currentYear = Year.now().getValue();
        String expectedPrefix = String.format("HH-%d-", currentYear);

        mockMvc.perform(post("/api/v1/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketId", startsWith(expectedPrefix)))
                .andExpect(jsonPath("$.subject", is("Unable to access interviews page")))
                .andExpect(jsonPath("$.description", is("Getting 404 whenever I click on candidate interviews schedule.")))
                .andExpect(jsonPath("$.category", is("TECHNICAL")))
                .andExpect(jsonPath("$.priority", is("HIGH")))
                .andExpect(jsonPath("$.status", is("OPEN")))
                .andExpect(jsonPath("$.createdAt", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/support/tickets - Successive ticket creations generate distinct unique ticket IDs")
    void testCreateTicket_ShouldGenerateUniqueTicketIds() throws Exception {
        CreateSupportTicketRequest req1 = CreateSupportTicketRequest.builder()
                .subject("Issue with resume scoring")
                .description("The resume score shows zero even though skills match perfectly.")
                .category(TicketCategory.APPLICATION)
                .priority(TicketPriority.MEDIUM)
                .build();

        CreateSupportTicketRequest req2 = CreateSupportTicketRequest.builder()
                .subject("Change account phone number")
                .description("Need to update my registered international telephone number.")
                .category(TicketCategory.ACCOUNT)
                .priority(TicketPriority.LOW)
                .build();

        MvcResult res1 = mockMvc.perform(post("/api/v1/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated())
                .andReturn();

        MvcResult res2 = mockMvc.perform(post("/api/v1/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isCreated())
                .andReturn();

        String ticketId1 = objectMapper.readTree(res1.getResponse().getContentAsString()).get("ticketId").asText();
        String ticketId2 = objectMapper.readTree(res2.getResponse().getContentAsString()).get("ticketId").asText();

        assertNotEquals(ticketId1, ticketId2, "Generated ticket IDs must be unique");
    }

    @Test
    @DisplayName("POST /api/v1/support/tickets - Rejects invalid short subject and description with 400 Bad Request")
    void testCreateTicket_InvalidFields_ShouldReturn400() throws Exception {
        // Too short subject (<5 chars) and too short description (<10 chars)
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Help")
                .description("broken")
                .category(TicketCategory.OTHER)
                .priority(TicketPriority.LOW)
                .build();

        mockMvc.perform(post("/api/v1/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/support/tickets - Rejects missing category and priority with 400 Bad Request")
    void testCreateTicket_MissingCategoryAndPriority_ShouldReturn400() throws Exception {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Valid Subject Here")
                .description("Valid description that is longer than ten characters.")
                .category(null)
                .priority(null)
                .build();

        mockMvc.perform(post("/api/v1/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/support/tickets - Authenticated user can retrieve their tickets")
    void testGetMyTickets_ShouldReturnOnlyUserTickets() throws Exception {
        // Create 1 ticket for User 1
        supportTicketService.createTicket(
                CreateSupportTicketRequest.builder()
                        .subject("User 1 ticket query")
                        .description("Detailed description for user 1 ticket query.")
                        .category(TicketCategory.PROFILE)
                        .priority(TicketPriority.MEDIUM)
                        .build(),
                user1SupabaseId
        );

        // Create 1 ticket for User 2
        supportTicketService.createTicket(
                CreateSupportTicketRequest.builder()
                        .subject("User 2 recruiter query")
                        .description("Detailed description for user 2 recruiter query.")
                        .category(TicketCategory.JOBS)
                        .priority(TicketPriority.URGENT)
                        .build(),
                user2SupabaseId
        );

        // Fetch tickets as User 1 -> should only return User 1's ticket
        mockMvc.perform(get("/api/v1/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].subject", is("User 1 ticket query")));
    }

    @Test
    @DisplayName("GET /api/v1/support/tickets/{ticketId} - Authenticated user can retrieve their own ticket")
    void testGetMyTicketById_OwnTicket_ShouldReturn200() throws Exception {
        var created = supportTicketService.createTicket(
                CreateSupportTicketRequest.builder()
                        .subject("Question regarding interview prep")
                        .description("Where can I find the AI interview recording transcripts?")
                        .category(TicketCategory.INTERVIEW)
                        .priority(TicketPriority.LOW)
                        .build(),
                user1SupabaseId
        );

        mockMvc.perform(get("/api/v1/support/tickets/" + created.getTicketId())
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketId", is(created.getTicketId())))
                .andExpect(jsonPath("$.subject", is("Question regarding interview prep")))
                .andExpect(jsonPath("$.category", is("INTERVIEW")));
    }

    @Test
    @DisplayName("GET /api/v1/support/tickets/{ticketId} - User cannot access another user's ticket (returns 404)")
    void testGetMyTicketById_OtherUserTicket_ShouldReturn404() throws Exception {
        // User 2 creates a ticket
        var user2Ticket = supportTicketService.createTicket(
                CreateSupportTicketRequest.builder()
                        .subject("Recruiter confidential issue")
                        .description("Candidate applicant data confidentiality inquiry.")
                        .category(TicketCategory.TECHNICAL)
                        .priority(TicketPriority.HIGH)
                        .build(),
                user2SupabaseId
        );

        // User 1 attempts to access User 2's ticket by ticketId
        mockMvc.perform(get("/api/v1/support/tickets/" + user2Ticket.getTicketId())
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString()))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Support ticket not found")));
    }

    @Test
    @DisplayName("POST /api/v1/support/tickets - Frontend cannot control ticketId (client-supplied ticketId is ignored)")
    void testCreateTicket_FrontendCannotControlTicketId() throws Exception {
        // Client maliciously supplies their own custom ticketId
        String payloadWithClientTicketId = """
                {
                    "ticketId": "HH-1999-999999",
                    "subject": "Testing client ID tampering rejection",
                    "description": "Attempting to inject custom ticket ID from frontend client.",
                    "category": "TECHNICAL",
                    "priority": "LOW"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadWithClientTicketId))
                .andExpect(status().isCreated())
                .andReturn();

        String responseTicketId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("ticketId").asText();

        assertNotEquals("HH-1999-999999", responseTicketId, "Client-provided ticketId must never be used");
        int currentYear = Year.now().getValue();
        assertTrue(responseTicketId.startsWith(String.format("HH-%d-", currentYear)),
                "Generated ticket ID must use server-side current year");
    }

    @Test
    @DisplayName("POST /api/v1/support/tickets - Concurrent client requests produce strictly unique ticket IDs")
    void testCreateTicket_ConcurrentClientRequests() throws Exception {
        int concurrentRequests = 5;
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(concurrentRequests);
        java.util.concurrent.CountDownLatch startLatch = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.CountDownLatch doneLatch = new java.util.concurrent.CountDownLatch(concurrentRequests);
        java.util.Set<String> generatedTicketIds = java.util.concurrent.ConcurrentHashMap.newKeySet();

        for (int i = 0; i < concurrentRequests; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    CreateSupportTicketRequest req = CreateSupportTicketRequest.builder()
                            .subject("Concurrent Ticket Submission " + index)
                            .description("Concurrent ticket description for testing uniqueness safety " + index)
                            .category(TicketCategory.OTHER)
                            .priority(TicketPriority.LOW)
                            .build();

                    MvcResult res = mockMvc.perform(post("/api/v1/support/tickets")
                                    .with(jwt().jwt(builder -> builder.subject(user1SupabaseId.toString())))
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(req)))
                            .andExpect(status().isCreated())
                            .andReturn();

                    String tid = objectMapper.readTree(res.getResponse().getContentAsString()).get("ticketId").asText();
                    generatedTicketIds.add(tid);
                } catch (Exception e) {
                    org.junit.jupiter.api.Assertions.fail("Concurrent request failed: " + e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean finished = doneLatch.await(15, java.util.concurrent.TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finished, "All concurrent requests must complete within timeout");
        org.junit.jupiter.api.Assertions.assertEquals(concurrentRequests, generatedTicketIds.size(),
                "All concurrent requests must generate unique ticket IDs");
    }
}
