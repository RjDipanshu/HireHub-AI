package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.assessment.AssessmentQuestionDTO;
import com.hirehub.hirehub_backend.dto.assessment.AssessmentResultDTO;
import com.hirehub.hirehub_backend.dto.assessment.AssessmentSubmissionDTO;
import com.hirehub.hirehub_backend.dto.assessment.SkillAssessmentDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateSkillBadgeDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.CandidateSkillBadge;
import com.hirehub.hirehub_backend.entity.Notification;
import com.hirehub.hirehub_backend.enums.NotificationType;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.CandidateSkillBadgeRepository;
import com.hirehub.hirehub_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillAssessmentService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillBadgeRepository candidateSkillBadgeRepository;
    private final NotificationRepository notificationRepository;

    private static class QuestionInternal {
        int id;
        String prompt;
        List<String> options;
        int correctOptionIndex;

        QuestionInternal(int id, String prompt, List<String> options, int correctOptionIndex) {
            this.id = id;
            this.prompt = prompt;
            this.options = options;
            this.correctOptionIndex = correctOptionIndex;
        }
    }

    private static class TopicConfig {
        String id;
        String title;
        String category;
        String description;
        String icon;
        String badgeTitle;
        List<QuestionInternal> questions;

        TopicConfig(String id, String title, String category, String description, String icon, String badgeTitle, List<QuestionInternal> questions) {
            this.id = id;
            this.title = title;
            this.category = category;
            this.description = description;
            this.icon = icon;
            this.badgeTitle = badgeTitle;
            this.questions = questions;
        }
    }

    private static final Map<String, TopicConfig> TOPICS = new LinkedHashMap<>();

    static {
        // Topic 1: Java & Spring Boot Core
        TOPICS.put("java-spring", new TopicConfig(
                "java-spring",
                "Java 17 & Spring Boot Core",
                "Backend Engineering",
                "Assess your knowledge of Java 17 features, Spring Boot 3 internals, Spring Data JPA, and transactional semantics.",
                "☕",
                "Verified Java & Spring Boot Developer",
                List.of(
                        new QuestionInternal(1, "What is the primary benefit of Java 21/17 Virtual Threads (Project Loom) compared to platform threads?",
                                List.of("They run at kernel priority level", "They are lightweight, managed by the JVM, and allow millions of concurrent tasks with low memory footprint", "They bypass the garbage collector entirely", "They replace the need for asynchronous programming in all languages"),
                                1),
                        new QuestionInternal(2, "In Spring Data JPA, which propagation mode in @Transactional creates a new physical transaction suspending the current one if one exists?",
                                List.of("PROPAGATION_REQUIRED", "PROPAGATION_NESTED", "PROPAGATION_REQUIRES_NEW", "PROPAGATION_SUPPORTS"),
                                2),
                        new QuestionInternal(3, "What does the @Component annotation stereotype designate in the Spring IoC container?",
                                List.of("A managed Spring bean eligible for component scanning and dependency injection", "A JPA entity automatically mapped to an RDBMS table", "A scheduled batch job executed asynchronously", "A secure endpoint accessible only to ADMIN roles"),
                                0),
                        new QuestionInternal(4, "Which HTTP status code is most appropriate when a requested resource is created successfully via POST?",
                                List.of("200 OK", "201 Created", "202 Accepted", "204 No Content"),
                                1),
                        new QuestionInternal(5, "In Hibernate/JPA, how can you solve the N+1 select problem when fetching related entities?",
                                List.of("Disable caching in application.properties", "Use JOIN FETCH in JPQL or @EntityGraph to fetch associations in a single query", "Always use FetchType.EAGER on every relationship", "Set the database isolation level to SERIALIZABLE"),
                                1)
                )
        ));

        // Topic 2: React 18 & Modern Web Architecture
        TOPICS.put("react", new TopicConfig(
                "react",
                "React 18 & Modern Web Architecture",
                "Frontend Engineering",
                "Validate proficiency in modern React hooks, reconciliation, concurrent rendering, and performant state handling.",
                "⚛️",
                "Verified React 18 Specialist",
                List.of(
                        new QuestionInternal(1, "What is the key purpose of the useMemo hook in React?",
                                List.of("To trigger a side-effect after DOM updates", "To memoize a calculated value between re-renders to avoid costly recalculations", "To bind a DOM node directly to a state variable", "To prevent a component from ever unmounting"),
                                1),
                        new QuestionInternal(2, "In React 18 Concurrent Mode, which hook allows you to defer updating a non-urgent part of the UI without blocking user input?",
                                List.of("useDeferredValue / useTransition", "useLayoutEffect", "useReducer", "useCallback"),
                                0),
                        new QuestionInternal(3, "Why should list keys in React never be set to random numbers (e.g., Math.random())?",
                                List.of("Because it causes syntax errors in JSX", "Because React will crash if keys are numbers", "Because changing keys on every render forces React to destroy and recreate the DOM nodes, ruining performance and focus state", "Because browser security prevents random keys"),
                                2),
                        new QuestionInternal(4, "What occurs when the dependency array of useEffect is omitted entirely (i.e. useEffect(fn))?",
                                List.of("The effect runs only once when the component mounts", "The effect never runs", "The effect runs after every single render of the component", "React throws an UnhandledRejection error"),
                                2),
                        new QuestionInternal(5, "What is the architectural purpose of React Server Components (RSC)?",
                                List.of("To execute React components entirely on the client browser", "To run components on the server with zero client-side JavaScript bundle overhead for those components", "To completely eliminate the need for any CSS stylesheets", "To replace SQL databases entirely"),
                                1)
                )
        ));

        // Topic 3: PostgreSQL & Database Design
        TOPICS.put("postgresql", new TopicConfig(
                "postgresql",
                "PostgreSQL & Database Design",
                "Database & Infrastructure",
                "Demonstrate mastery of relational indexing, execution plans, ACID transactions, and schema normalization.",
                "🐘",
                "Verified PostgreSQL Specialist",
                List.of(
                        new QuestionInternal(1, "Which index type in PostgreSQL is the default and best suited for equality and range queries?",
                                List.of("Hash Index", "GIN Index", "B-Tree Index", "BRIN Index"),
                                2),
                        new QuestionInternal(2, "What command in PostgreSQL is used to analyze the execution plan and actual execution time of a query?",
                                List.of("EXPLAIN ANALYZE <query>", "DESCRIBE PLAN <query>", "SHOW PROFILE <query>", "INSPECT QUERY <query>"),
                                0),
                        new QuestionInternal(3, "In ACID transaction properties, what does 'Isolation' guarantee?",
                                List.of("All transactions finish in less than 100 milliseconds", "Concurrent transactions execute without interfering with one another's intermediate state", "Changes are committed permanently even in case of power failure", "All foreign key constraints are evaluated asynchronously"),
                                1),
                        new QuestionInternal(4, "Which PostgreSQL data type is recommended for storing arbitrary structured JSON documents with fast key lookup indexing?",
                                List.of("TEXT", "VARCHAR", "JSONB", "BLOB"),
                                2),
                        new QuestionInternal(5, "What is a major advantage of Table Partitioning in PostgreSQL for large datasets?",
                                List.of("It allows pruning unneeded partitions during queries, reducing I/O and speeding up execution", "It replaces the need for primary keys", "It guarantees zero memory usage on the database host", "It disables write-ahead logging (WAL) completely"),
                                0)
                )
        ));

        // Topic 4: System Design & Distributed Systems
        TOPICS.put("system-design", new TopicConfig(
                "system-design",
                "System Design & Distributed Systems",
                "Architecture & Scalability",
                "Test system scalability principles: caching strategies, CAP theorem, idempotency, and message brokers.",
                "🏛️",
                "Verified System Architect",
                List.of(
                        new QuestionInternal(1, "According to the CAP theorem, what trade-off must a distributed system make in the presence of a network partition (P)?",
                                List.of("Choose between Speed (S) and Cost (C)", "Choose between Consistency (C) and Availability (A)", "Choose between Security (S) and Throughput (T)", "Choose between Latency (L) and Redundancy (R)"),
                                1),
                        new QuestionInternal(2, "What is the primary benefit of making an API endpoint idempotent?",
                                List.of("It ensures multiple identical requests produce the same server-side state as a single request, safely handling retries", "It prevents cross-site scripting (XSS) attacks", "It compresses JSON payloads by 50%", "It removes the need for database indexes"),
                                0),
                        new QuestionInternal(3, "Which caching strategy writes data simultaneously to both the cache and the backing database before returning success?",
                                List.of("Cache-Aside (Lazy Loading)", "Write-Through", "Write-Back (Write-Behind)", "Refresh-Ahead"),
                                1),
                        new QuestionInternal(4, "What is the primary purpose of a Consistent Hashing ring in distributed cache systems (like Dynamo or Memcached clusters)?",
                                List.of("To encrypt cache entries end-to-end", "To minimize key remapping and cache invalidation when servers are added or removed", "To ensure all cache entries expire after exactly 60 seconds", "To eliminate the need for network serialization"),
                                1),
                        new QuestionInternal(5, "When decoupling high-throughput services, why is an asynchronous event queue (like Kafka or RabbitMQ) preferred over synchronous REST calls?",
                                List.of("It buffers traffic spikes, provides fault isolation, and enables consumers to process messages at their own pace", "It eliminates CPU utilization on the producer service", "It guarantees sub-millisecond round-trip response to the user", "It prevents network timeouts from ever being logged"),
                                0)
                )
        ));

        // Topic 5: Python, Docker & CI/CD Pipelines
        TOPICS.put("python-devops", new TopicConfig(
                "python-devops",
                "Python, Docker & CI/CD Pipelines",
                "DevOps & Automation",
                "Assess knowledge of containerization, multistage Docker builds, CI/CD pipelines, and Python production engineering.",
                "🐳",
                "Verified DevOps & Automation Specialist",
                List.of(
                        new QuestionInternal(1, "What is the primary architectural advantage of a multi-stage Dockerfile build?",
                                List.of("It produces an extremely small production image by discarding build tools, compilers, and intermediate layers", "It eliminates the need for container registries like Docker Hub", "It runs multiple containers concurrently on a single port", "It automatically runs Kubernetes pods without a cluster"),
                                0),
                        new QuestionInternal(2, "In Python, what is the key difference between a normal function and a generator function containing 'yield'?",
                                List.of("Generators return all items loaded in memory at once", "Generators produce items lazily on demand one at a time, conserving memory for large sequences", "Generators cannot be used in for-loops", "Generators run in separate OS processes automatically"),
                                1),
                        new QuestionInternal(3, "In a robust CI/CD pipeline, why are automated unit and lint tests run before building and deploying the container image?",
                                List.of("To ensure fast feedback and 'fail early' before wasting time and compute on containerization and deployment", "Because Docker cannot build code that has not been linted", "To bypass staging environments entirely", "To update the Git commit message automatically"),
                                0),
                        new QuestionInternal(4, "Which HTTP header is commonly set by reverse proxies (such as Nginx) to forward the client's real IP address to the upstream backend?",
                                List.of("X-Forwarded-For", "X-Request-Secret", "X-Server-Host", "X-Cache-Status"),
                                0),
                        new QuestionInternal(5, "What is the function of a Kubernetes Horizontal Pod Autoscaler (HPA)?",
                                List.of("It scales the number of pod replicas automatically based on observed CPU utilization or custom metrics", "It updates the DNS names of worker nodes", "It restarts crashed pods with new container tags", "It manages SSL certificate renewal"),
                                0)
                )
        ));
    }

    public List<SkillAssessmentDTO> getAllAssessments(UUID candidateProfileId) {
        Set<String> passedTopics = new HashSet<>();
        if (candidateProfileId != null) {
            List<CandidateSkillBadge> badges = candidateSkillBadgeRepository
                    .findByCandidateProfileIdAndIsDeletedFalseOrderByIssuedAtDesc(candidateProfileId);
            for (CandidateSkillBadge b : badges) {
                if (Boolean.TRUE.equals(b.getIsPassed())) {
                    passedTopics.add(b.getSkillName().toLowerCase());
                }
            }
        }

        return TOPICS.values().stream().map(topic -> SkillAssessmentDTO.builder()
                .topicId(topic.id)
                .title(topic.title)
                .category(topic.category)
                .description(topic.description)
                .icon(topic.icon)
                .durationMinutes(5)
                .passingScorePercentage(70)
                .totalQuestions(topic.questions.size())
                .alreadyPassed(passedTopics.contains(topic.title.toLowerCase()) || passedTopics.contains(topic.id.toLowerCase()))
                .build()
        ).collect(Collectors.toList());
    }

    public SkillAssessmentDTO getAssessmentQuestions(String topicId) {
        TopicConfig topic = TOPICS.get(topicId);
        if (topic == null) {
            throw new RuntimeException("Assessment topic not found: " + topicId);
        }

        List<AssessmentQuestionDTO> questions = topic.questions.stream().map(q ->
                AssessmentQuestionDTO.builder()
                        .id(q.id)
                        .question(q.prompt)
                        .options(q.options)
                        .build()
        ).collect(Collectors.toList());

        return SkillAssessmentDTO.builder()
                .topicId(topic.id)
                .title(topic.title)
                .category(topic.category)
                .description(topic.description)
                .icon(topic.icon)
                .durationMinutes(5)
                .passingScorePercentage(70)
                .totalQuestions(questions.size())
                .questions(questions)
                .build();
    }

    @Transactional
    public AssessmentResultDTO evaluateAssessment(UUID candidateProfileId, AssessmentSubmissionDTO submission) {
        TopicConfig topic = TOPICS.get(submission.getTopicId());
        if (topic == null) {
            throw new RuntimeException("Assessment topic not found: " + submission.getTopicId());
        }

        CandidateProfile profile = candidateProfileRepository.findByIdAndIsDeletedFalse(candidateProfileId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found with ID: " + candidateProfileId));

        Map<Integer, Integer> candidateAnswers = submission.getAnswers() != null ? submission.getAnswers() : Collections.emptyMap();
        int correctCount = 0;
        int totalQuestions = topic.questions.size();

        for (QuestionInternal q : topic.questions) {
            Integer selectedOption = candidateAnswers.get(q.id);
            if (selectedOption != null && selectedOption == q.correctOptionIndex) {
                correctCount++;
            }
        }

        double scorePercentage = Math.round(((double) correctCount / totalQuestions) * 100.0 * 10.0) / 10.0;
        boolean passed = scorePercentage >= 70.0;

        CandidateSkillBadgeDTO badgeDTO = null;

        if (passed) {
            // Find existing or save new badge
            Optional<CandidateSkillBadge> existingOpt = candidateSkillBadgeRepository
                    .findByCandidateProfileIdAndSkillNameIgnoreCaseAndIsDeletedFalse(candidateProfileId, topic.title);

            CandidateSkillBadge badge = existingOpt.orElseGet(() -> {
                CandidateSkillBadge newBadge = new CandidateSkillBadge();
                newBadge.setCandidateProfile(profile);
                newBadge.setSkillName(topic.title);
                newBadge.setIsDeleted(false);
                return newBadge;
            });

            badge.setBadgeTitle(topic.badgeTitle);
            badge.setScore(scorePercentage);
            badge.setIsPassed(true);
            badge.setIssuedAt(LocalDateTime.now());
            CandidateSkillBadge savedBadge = candidateSkillBadgeRepository.save(badge);

            badgeDTO = CandidateSkillBadgeDTO.builder()
                    .id(savedBadge.getId())
                    .candidateProfileId(profile.getId())
                    .skillName(savedBadge.getSkillName())
                    .badgeTitle(savedBadge.getBadgeTitle())
                    .score(savedBadge.getScore())
                    .isPassed(savedBadge.getIsPassed())
                    .issuedAt(savedBadge.getIssuedAt())
                    .build();

            // Send celebration notification to user
            if (profile.getUser() != null) {
                Notification notif = new Notification();
                notif.setUser(profile.getUser());
                notif.setTitle("🎉 Skill Badge Earned: " + topic.badgeTitle);
                notif.setMessage("Congratulations! You passed the " + topic.title + " assessment with a score of " + scorePercentage + "%. Your verified badge is now visible on your profile and search cards.");
                notif.setType(NotificationType.SYSTEM);
                notif.setLinkUrl("/candidate/profile");
                notif.setIsDeleted(false);
                notificationRepository.save(notif);
            }
        }

        String feedback = passed
                ? "Excellent job! You demonstrated mastery of " + topic.title + " and earned the verified skill badge."
                : "Good effort! You scored " + scorePercentage + "%. A passing score of 70% is required to earn the verified badge. You can review the concepts and retake the assessment.";

        return AssessmentResultDTO.builder()
                .topicId(topic.id)
                .title(topic.title)
                .totalQuestions(totalQuestions)
                .correctCount(correctCount)
                .scorePercentage(scorePercentage)
                .passed(passed)
                .feedback(feedback)
                .badge(badgeDTO)
                .build();
    }

    public List<CandidateSkillBadgeDTO> getCandidateBadges(UUID candidateProfileId) {
        return candidateSkillBadgeRepository
                .findByCandidateProfileIdAndIsDeletedFalseOrderByIssuedAtDesc(candidateProfileId)
                .stream().map(b -> CandidateSkillBadgeDTO.builder()
                        .id(b.getId())
                        .candidateProfileId(candidateProfileId)
                        .skillName(b.getSkillName())
                        .badgeTitle(b.getBadgeTitle())
                        .score(b.getScore())
                        .isPassed(b.getIsPassed())
                        .issuedAt(b.getIssuedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
