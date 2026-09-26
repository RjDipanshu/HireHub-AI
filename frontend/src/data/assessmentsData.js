/**
 * HireHub AI — Standardized Technical Skill Assessments & Quizzes
 * 18 Trending Engineering, Cloud, AI, Security, Product, and Design Domains.
 * Complete with questions, 4 distinct options, genuine correct answers, and in-depth technical explanations.
 */

export const ASSESSMENT_CATALOG = [
  {
    topicId: 'java-spring',
    title: 'Java 17 & Spring Boot Core',
    category: 'Backend Engineering',
    description: 'Assess your knowledge of Java 17/21 features, Spring Boot 3 internals, Spring Data JPA, and transactional semantics.',
    icon: '☕',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Java & Spring Boot Developer'
  },
  {
    topicId: 'react',
    title: 'React 18 & Modern Web Architecture',
    category: 'Frontend & Fullstack',
    description: 'Validate proficiency in modern React hooks, reconciliation, concurrent rendering, and performant state handling.',
    icon: '⚛️',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified React 18 Specialist'
  },
  {
    topicId: 'nextjs-fullstack',
    title: 'Next.js 14, App Router & SSR',
    category: 'Frontend & Fullstack',
    description: 'Mastery of Server Components (RSC), App Router, streaming SSR, Server Actions, route handlers, and edge caching.',
    icon: '▲',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Next.js Fullstack Architect'
  },
  {
    topicId: 'postgresql',
    title: 'PostgreSQL & Database Design',
    category: 'Database & Infrastructure',
    description: 'Demonstrate mastery of relational indexing, execution plans, ACID transactions, partitioning, and schema normalization.',
    icon: '🐘',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified PostgreSQL Specialist'
  },
  {
    topicId: 'system-design',
    title: 'System Design & Distributed Systems',
    category: 'Architecture & Scalability',
    description: 'Test system scalability principles: caching strategies, CAP theorem, idempotency, event-driven messaging, and sharding.',
    icon: '🏛️',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified System Architect'
  },
  {
    topicId: 'python-devops',
    title: 'Python, Docker & CI/CD Pipelines',
    category: 'DevOps & Automation',
    description: 'Assess knowledge of containerization, multistage Docker builds, GitHub Actions CI/CD pipelines, and Python async runtime.',
    icon: '🐳',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified DevOps & Automation Specialist'
  },
  {
    topicId: 'gen-ai-llm',
    title: 'Generative AI, LLMs & Prompt Engineering',
    category: 'AI & Machine Learning',
    description: 'Evaluate understanding of Large Language Models, RAG (Retrieval-Augmented Generation), vector databases, embeddings, and LangChain.',
    icon: '🤖',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified GenAI & LLM Practitioner'
  },
  {
    topicId: 'cloud-aws',
    title: 'AWS Cloud Architecture & Serverless',
    category: 'Cloud Computing',
    description: 'Test AWS services including Lambda, ECS, S3, DynamoDB, API Gateway, IAM security policies, and VPC networking.',
    icon: '☁️',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified AWS Cloud Architect'
  },
  {
    topicId: 'kubernetes-k8s',
    title: 'Kubernetes Container Orchestration',
    category: 'Cloud & DevOps',
    description: 'Test production Kubernetes knowledge: Pod lifecycle, Ingress controllers, Helm charts, HPA autoscaling, and ConfigMaps.',
    icon: '☸️',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Kubernetes Administrator'
  },
  {
    topicId: 'cybersecurity',
    title: 'Cyber Security, OWASP & Web Security',
    category: 'Security & Compliance',
    description: 'Validate expertise in OWASP Top 10, XSS, CSRF, SQL injection defenses, JWT hardening, TLS encryption, and secure coding.',
    icon: '🛡️',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Application Security Specialist'
  },
  {
    topicId: 'data-engineering',
    title: 'Data Engineering, Apache Spark & Kafka',
    category: 'Big Data & Analytics',
    description: 'Mastery of event streaming architectures, distributed Spark transformations, data pipelines, schema registries, and Parquet lakes.',
    icon: '📊',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Data & Streaming Engineer'
  },
  {
    topicId: 'machine-learning',
    title: 'Machine Learning, Scikit-Learn & PyTorch',
    category: 'AI & Machine Learning',
    description: 'Test core ML fundamentals: loss functions, gradient descent, overfitting mitigation, cross-validation, and neural network layers.',
    icon: '🧠',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Machine Learning Engineer'
  },
  {
    topicId: 'nodejs-microservices',
    title: 'Node.js, Express & Microservices',
    category: 'Backend Engineering',
    description: 'Assess event loop mechanics, non-blocking I/O, cluster module, middleware pipelines, and resilient REST/gRPC microservices.',
    icon: '🟩',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Node.js Backend Engineer'
  },
  {
    topicId: 'typescript-advanced',
    title: 'Advanced TypeScript & Type Systems',
    category: 'Frontend & Fullstack',
    description: 'Validate advanced generics, conditional types, mapped types, discriminated unions, utility types, and strict compiler configs.',
    icon: '🔷',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Advanced TypeScript Developer'
  },
  {
    topicId: 'uiux-design',
    title: 'UI/UX Design Systems, Figma & Usability',
    category: 'Product & Design',
    description: 'Test design tokens, WCAG 2.1 AA accessibility guidelines, visual hierarchy, user research methodologies, and interactive prototyping.',
    icon: '🎨',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Product Designer & UX Specialist'
  },
  {
    topicId: 'product-management',
    title: 'Tech Product Management & Agile Scrum',
    category: 'Product & Strategy',
    description: 'Evaluate PRD authoring, North Star metrics, user story mapping, sprint ceremonies, RICE prioritization, and MVP validation.',
    icon: '🚀',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Technical Product Manager'
  },
  {
    topicId: 'mobile-flutter',
    title: 'Flutter & Cross-Platform Mobile Dev',
    category: 'Mobile Engineering',
    description: 'Assess Flutter widget tree lifecycles, state management (Bloc/Provider), asynchronous isolates, and native platform channels.',
    icon: '📱',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Flutter Mobile Developer'
  },
  {
    topicId: 'blockchain-web3',
    title: 'Web3, Solidity & Smart Contract Security',
    category: 'Blockchain & Web3',
    description: 'Validate Ethereum EVM fundamentals, Solidity gas optimization, reentrancy guard patterns, ERC standards, and decentralized custody.',
    icon: '🔗',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    alreadyPassed: false,
    badgeTitle: 'Verified Web3 & Smart Contract Developer'
  }
];

export const ASSESSMENT_QUESTIONS_MAP = {
  'java-spring': {
    topicId: 'java-spring',
    title: 'Java 17 & Spring Boot Core',
    category: 'Backend Engineering',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What is the primary benefit of Java Virtual Threads (Project Loom) compared to standard OS platform threads?',
        options: [
          'They run directly at the operating system kernel priority level',
          'They are lightweight, managed by the JVM runtime, allowing millions of concurrent tasks with minimal memory overhead',
          'They bypass garbage collection routines completely',
          'They replace the necessity for asynchronous programming in all programming languages'
        ],
        correctOptionIndex: 1,
        explanation: 'Virtual threads are lightweight threads managed entirely by the JVM rather than the OS kernel. A single JVM can support millions of virtual threads concurrently, dramatically improving throughput for I/O-bound workloads without complex reactive code.'
      },
      {
        id: 2,
        question: 'In Spring Data JPA, which propagation mode in @Transactional creates a brand new physical transaction, suspending the current active transaction if one exists?',
        options: [
          'PROPAGATION_REQUIRED',
          'PROPAGATION_NESTED',
          'PROPAGATION_REQUIRES_NEW',
          'PROPAGATION_SUPPORTS'
        ],
        correctOptionIndex: 2,
        explanation: 'PROPAGATION_REQUIRES_NEW always executes inside an independent physical transaction. If a transaction is already running, it is suspended until the new transaction completes or rolls back.'
      },
      {
        id: 3,
        question: 'What does the @Component annotation stereotype designate in the Spring IoC container?',
        options: [
          'A managed Spring bean eligible for auto-detection during component scanning and dependency injection',
          'A JPA entity automatically mapped to a relational database table',
          'A scheduled batch job executed asynchronously on a cron trigger',
          'A secure endpoint restricted strictly to administrative users'
        ],
        correctOptionIndex: 0,
        explanation: '@Component is the generic stereotype annotation for any Spring-managed component. Annotations like @Service, @Repository, and @Controller are specializations of @Component.'
      },
      {
        id: 4,
        question: 'Which HTTP status code is most appropriate when a requested resource is created successfully via POST?',
        options: ['200 OK', '201 Created', '202 Accepted', '204 No Content'],
        correctOptionIndex: 1,
        explanation: 'RFC 9110 specifies HTTP 201 Created as the standard response when an HTTP POST or PUT request successfully creates one or more new resources on the server.'
      },
      {
        id: 5,
        question: 'In Hibernate/JPA, how can you effectively eliminate the N+1 select query problem when fetching parent entities and their associations?',
        options: [
          'Disable first-level cache in application.properties',
          'Use JOIN FETCH in JPQL or define an @EntityGraph to fetch associations in a single SQL query',
          'Always set FetchType.EAGER on every entity relationship',
          'Increase the database transaction isolation level to SERIALIZABLE'
        ],
        correctOptionIndex: 1,
        explanation: 'Using JOIN FETCH or @EntityGraph forces Hibernate to perform an SQL INNER/LEFT JOIN in a single round-trip, preventing the N additional queries triggered when lazily accessing children.'
      }
    ]
  },

  'react': {
    topicId: 'react',
    title: 'React 18 & Modern Web Architecture',
    category: 'Frontend & Fullstack',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What is the primary purpose of the useMemo hook in modern React?',
        options: [
          'To run an asynchronous side-effect after the DOM has been painted',
          'To memoize a calculated value between re-renders to prevent unnecessary costly recalculations',
          'To bind a mutable DOM element directly to a state variable',
          'To force React to skip rendering child components forever'
        ],
        correctOptionIndex: 1,
        explanation: 'useMemo caches the result of an expensive calculation between renders. React will only recalculate the value if one of the dependencies in the dependency array has changed.'
      },
      {
        id: 2,
        question: 'In React 18 Concurrent Features, which hook allows you to mark a state update as non-urgent so user typing and clicks remain responsive?',
        options: [
          'useTransition / useDeferredValue',
          'useLayoutEffect',
          'useImperativeHandle',
          'useDebugValue'
        ],
        correctOptionIndex: 0,
        explanation: 'startTransition and useTransition let you mark UI updates as transitions, meaning React can interrupt them to prioritize urgent events like typing or clicking.'
      },
      {
        id: 3,
        question: 'Why should keys in dynamic React lists NEVER be set to Math.random() or index when items are sorted or filtered?',
        options: [
          'Because React rejects numeric keys with a syntax error',
          'Because changing keys on each render forces React to destroy and recreate the DOM nodes, degrading performance and losing input focus',
          'Because browsers block random keys for cryptographic security',
          'Because CSS animations cannot target non-sequential keys'
        ],
        correctOptionIndex: 1,
        explanation: 'React uses keys to identify which items have changed, added, or removed. Unstable keys cause entire DOM subtrees to be unmounted and remounted needlessly on every render.'
      },
      {
        id: 4,
        question: 'What occurs when the dependency array of useEffect is omitted completely (i.e., useEffect(() => { ... }))?',
        options: [
          'The effect executes only once after initial component mount',
          'The effect never executes',
          'The effect executes after every single render of the component',
          'React raises an UncaughtTypeError exception'
        ],
        correctOptionIndex: 2,
        explanation: 'Without a dependency array, useEffect runs after the initial mount and after every subsequent render update.'
      },
      {
        id: 5,
        question: 'What is the main architectural benefit of React Server Components (RSC)?',
        options: [
          'They execute exclusively on the client device inside a web worker',
          'They execute on the server and ship zero JavaScript bundle overhead to the client for those components',
          'They completely replace the need for CSS and stylesheets',
          'They eliminate the need for SQL database engines'
        ],
        correctOptionIndex: 1,
        explanation: 'React Server Components execute only on the server. Their code and dependencies are not bundled into the client download, reducing JavaScript bundle size and boosting page load speed.'
      }
    ]
  },

  'nextjs-fullstack': {
    topicId: 'nextjs-fullstack',
    title: 'Next.js 14, App Router & SSR',
    category: 'Frontend & Fullstack',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'In Next.js App Router (app directory), what directive must be placed at the top of a file to make a component a Client Component?',
        options: [
          "'use client'",
          "'use browser'",
          "'client-only'",
          "'enable client'"
        ],
        correctOptionIndex: 0,
        explanation: "'use client' is the official React directive that establishes a boundary between Server and Client component modules in the Next.js App Router."
      },
      {
        id: 2,
        question: 'What is the primary benefit of Server Actions in Next.js 14?',
        options: [
          'They allow executing server-side mutations directly from forms and buttons without manually writing custom REST API boilerplate',
          'They eliminate the need for Node.js on the hosting platform',
          'They compile TypeScript code into WebAssembly in real time',
          'They convert all PNG images into SVG format automatically'
        ],
        correctOptionIndex: 0,
        explanation: 'Server Actions allow client forms and event handlers to invoke asynchronous server functions directly, integrating seamlessly with progressive enhancement and caching.'
      },
      {
        id: 3,
        question: 'How do you trigger on-demand cache revalidation for a specific tag or path in Next.js 14?',
        options: [
          'revalidateTag() or revalidatePath() from next/cache',
          'window.location.reload(true)',
          'process.env.PURGE_CACHE = true',
          'cacheControl.clear()'
        ],
        correctOptionIndex: 0,
        explanation: "Next.js provides revalidateTag() and revalidatePath() inside 'next/cache' to purge cached data on demand when database records change."
      },
      {
        id: 4,
        question: 'What special file name is used in Next.js App Router to render an instant loading skeleton using React Suspense?',
        options: ['loading.jsx / loading.tsx', 'spinner.jsx', 'fallback.jsx', 'suspense.jsx'],
        correctOptionIndex: 0,
        explanation: 'Next.js automatically wraps page contents inside a React Suspense boundary when a loading.tsx/loading.jsx file is created in the same directory segment.'
      },
      {
        id: 5,
        question: 'What does the generateStaticParams function do in dynamic App Router segments (e.g. [id])?',
        options: [
          'It statically pre-renders routes at build time for defined param values',
          'It generates random UUIDs for database records',
          'It parses incoming query strings on the client',
          'It creates CSS variables dynamically'
        ],
        correctOptionIndex: 0,
        explanation: 'generateStaticParams is used in combination with dynamic route segments to statically generate routes at build time rather than on demand at request time.'
      }
    ]
  },

  'postgresql': {
    topicId: 'postgresql',
    title: 'PostgreSQL & Database Design',
    category: 'Database & Infrastructure',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'Which index type in PostgreSQL is the default and optimal for general equality and range queries (<, <=, =, >=, >)?',
        options: ['Hash Index', 'GIN Index', 'B-Tree Index', 'BRIN Index'],
        correctOptionIndex: 2,
        explanation: 'B-Tree (Balanced Tree) is the default PostgreSQL index structure. It provides logarithmic O(log N) lookup time and handles both equality checks and range scans efficiently.'
      },
      {
        id: 2,
        question: 'What command in PostgreSQL is used to analyze the query planner execution plan alongside actual runtime statistics and timings?',
        options: ['EXPLAIN ANALYZE <query>', 'DESCRIBE PLAN <query>', 'SHOW PROFILE <query>', 'INSPECT QUERY <query>'],
        correctOptionIndex: 0,
        explanation: 'EXPLAIN ANALYZE executes the statement and displays actual elapsed times and row counts for each execution node, rather than just planner estimates.'
      },
      {
        id: 3,
        question: "In ACID transaction properties, what does the 'I' (Isolation) guarantee?",
        options: [
          'All queries complete in under 50 milliseconds',
          'Concurrent transactions execute without seeing partial, uncommitted modifications from other transactions',
          'Data is written to tape backup drives immediately',
          'Foreign keys are enforced across different database engines'
        ],
        correctOptionIndex: 1,
        explanation: 'Isolation ensures that concurrent execution of transactions leaves the database in the same state that would have been obtained if the transactions were executed sequentially.'
      },
      {
        id: 4,
        question: 'Which PostgreSQL data type is recommended for storing arbitrary JSON documents with indexing and fast sub-key query performance?',
        options: ['TEXT', 'VARCHAR', 'JSONB', 'BYTEA'],
        correctOptionIndex: 2,
        explanation: 'JSONB stores JSON in a decomposed binary format. It supports GIN indexing, does not require re-parsing on reads, and executes operations significantly faster than plain JSON.'
      },
      {
        id: 5,
        question: 'What is the primary benefit of Declarative Table Partitioning in PostgreSQL for huge tables?',
        options: [
          'It enables partition pruning during queries, allowing the engine to skip scanning irrelevant partitions and reduce disk I/O',
          'It eliminates the requirement of primary keys',
          'It stores all rows exclusively in RAM memory',
          'It completely turns off Write-Ahead Logging (WAL)'
        ],
        correctOptionIndex: 0,
        explanation: 'Partition pruning allows the query planner to analyze WHERE clauses and completely exclude partitions that cannot contain matching rows, saving substantial disk I/O.'
      }
    ]
  },

  'system-design': {
    topicId: 'system-design',
    title: 'System Design & Distributed Systems',
    category: 'Architecture & Scalability',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'According to the CAP theorem, what choice must a distributed data store make during an unavoidable network partition (P)?',
        options: [
          'Choose between Speed (S) and Cost (C)',
          'Choose between Consistency (C) and Availability (A)',
          'Choose between Security (S) and Throughput (T)',
          'Choose between Latency (L) and Redundancy (R)'
        ],
        correctOptionIndex: 1,
        explanation: 'The CAP theorem states that in the event of a network partition (P), a distributed system must trade off between either remaining Available (returning stale data) or Consistent (failing or waiting for sync).'
      },
      {
        id: 2,
        question: 'What does Idempotency mean in the context of distributed API design (e.g., payment webhooks)?',
        options: [
          'Making multiple identical requests produces the exact same server state as making a single request, safely tolerating retries',
          'Compressing JSON payloads using Gzip compression',
          'Encrypting requests with RSA-4096 keys',
          'Converting REST endpoints into GraphQL queries automatically'
        ],
        correctOptionIndex: 0,
        explanation: 'An idempotent operation can be applied multiple times without changing the result beyond the initial application. This is essential for network retries and webhook delivery.'
      },
      {
        id: 3,
        question: 'Which caching strategy writes data simultaneously to both the cache and the backing database before acknowledging completion?',
        options: ['Cache-Aside (Lazy Loading)', 'Write-Through', 'Write-Back (Write-Behind)', 'Refresh-Ahead'],
        correctOptionIndex: 1,
        explanation: 'Write-Through cache writes data to the cache and the permanent database store synchronously before returning success to the caller, ensuring cache consistency.'
      },
      {
        id: 4,
        question: 'What is the primary function of a Consistent Hashing ring in distributed caches and databases?',
        options: [
          'To encrypt cache keys with SHA-256',
          'To minimize key remapping when cache nodes are added or removed, preventing massive cache stampedes',
          'To ensure all items expire after exactly 60 seconds',
          'To replicate data across cloud regions'
        ],
        correctOptionIndex: 1,
        explanation: 'Consistent hashing maps keys and nodes to positions on a hash ring so that adding or removing a server only requires remapping K/N keys on average, rather than all keys.'
      },
      {
        id: 5,
        question: 'Why are distributed message brokers like Apache Kafka preferred over synchronous HTTP calls for microservice communication?',
        options: [
          'They buffer spikes, decouple service availability, and allow consumers to process events at their own rate',
          'They reduce server CPU utilization to zero percent',
          'They guarantee sub-millisecond round-trip response to end users',
          'They prevent any network timeouts from ever being logged'
        ],
        correctOptionIndex: 0,
        explanation: 'Message brokers provide asynchronous decoupling: if a downstream consumer goes down or suffers high load, messages are persisted safely in the queue without crashing the producer.'
      }
    ]
  },

  'python-devops': {
    topicId: 'python-devops',
    title: 'Python, Docker & CI/CD Pipelines',
    category: 'DevOps & Automation',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What is the primary architectural advantage of a multi-stage Dockerfile build?',
        options: [
          'It produces an extremely small production image by discarding compilers, build tools, and dev dependencies',
          'It eliminates the need for container registries like Docker Hub',
          'It runs multiple distinct containers concurrently on a single port',
          'It automatically sets up a Kubernetes cluster locally'
        ],
        correctOptionIndex: 0,
        explanation: 'Multi-stage builds allow you to use large images with SDKs and build tools in early stages, then copy only the finalized compiled artifacts into a lightweight production runtime base image.'
      },
      {
        id: 2,
        question: "In Python, what is the key difference between a normal function and a generator function using 'yield'?",
        options: [
          'Generators allocate and return the complete list in memory all at once',
          'Generators produce values lazily on demand one at a time, conserving memory for large sequences',
          'Generators cannot be iterated over in for-loops',
          'Generators execute in a separate OS thread automatically'
        ],
        correctOptionIndex: 1,
        explanation: 'Generators yield values on demand (lazy evaluation), maintaining their execution state between calls, which consumes very little RAM even when processing millions of items.'
      },
      {
        id: 3,
        question: 'In a production CI/CD pipeline, why are automated unit tests and linters executed before container build steps?',
        options: [
          'To fail early and provide fast developer feedback before spending expensive compute and time building images',
          'Because Docker cannot build code that contains linting errors',
          'To bypass staging environments entirely',
          'To automatically push changes to production branches'
        ],
        correctOptionIndex: 0,
        explanation: 'Failing fast saves pipeline minutes, cloud compute costs, and developer wait time by flagging broken syntax, test failures, or security flaws before heavy build steps run.'
      },
      {
        id: 4,
        question: 'Which HTTP header is commonly set by reverse proxies (such as Nginx) to forward the client original IP address to the backend?',
        options: ['X-Forwarded-For', 'X-Origin-Host', 'Client-Secret-Key', 'X-Gateway-Route'],
        correctOptionIndex: 0,
        explanation: 'X-Forwarded-For (XFF) is the de-facto standard header for identifying the originating IP address of a client connecting to a web server through an HTTP proxy or load balancer.'
      },
      {
        id: 5,
        question: 'What is the function of the Global Interpreter Lock (GIL) in standard CPython?',
        options: [
          'It is a mutex that prevents multiple native threads from executing Python bytecodes at once in a single process',
          'It speeds up mathematical calculations by 10x',
          'It encrypts Python bytecode against reverse engineering',
          'It locks database connections during transactions'
        ],
        correctOptionIndex: 0,
        explanation: 'The CPython GIL ensures thread-safe memory management by allowing only one native thread to execute Python bytecode at a time per process.'
      }
    ]
  },

  'gen-ai-llm': {
    topicId: 'gen-ai-llm',
    title: 'Generative AI, LLMs & Prompt Engineering',
    category: 'AI & Machine Learning',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What is the purpose of Retrieval-Augmented Generation (RAG) in LLM applications?',
        options: [
          'To ground the LLM responses with proprietary, up-to-date facts fetched from a vector knowledge base at query time, reducing hallucinations',
          'To compress the model weights from 70B parameters down to 7B parameters',
          'To re-train the neural network weights on every user query',
          'To convert text responses into high-resolution 3D graphics'
        ],
        correctOptionIndex: 0,
        explanation: 'RAG retrieves relevant domain document chunks via semantic search and injects them into the LLM context prompt, enabling accurate, factual answers without expensive fine-tuning.'
      },
      {
        id: 2,
        question: 'What does the Temperature parameter (ranging from 0.0 to 1.0+) control when sampling tokens from an LLM?',
        options: [
          'The physical heat dissipation of the GPU cluster',
          'The randomness and creativity of generated text (lower is more deterministic and factual; higher is more creative)',
          'The maximum number of tokens allowed in the response',
          'The API request timeout in seconds'
        ],
        correctOptionIndex: 1,
        explanation: 'Temperature flattens or sharpens the probability distribution over candidate tokens. A temperature near 0 makes the model pick the most likely tokens (deterministic), while higher values produce more varied and creative text.'
      },
      {
        id: 3,
        question: 'Which mathematical metric is most commonly used to measure the semantic similarity between two embedding vectors?',
        options: ['Cosine Similarity', 'Manhattan Distance', 'Hamming Distance', 'Jaccard Index'],
        correctOptionIndex: 0,
        explanation: 'Cosine similarity measures the cosine of the angle between two multi-dimensional vectors, capturing semantic alignment independent of vector magnitude.'
      },
      {
        id: 4,
        question: 'What is Few-Shot Prompting in modern Prompt Engineering?',
        options: [
          'Providing a few input-output examples directly inside the prompt to guide the model on formatting and logic',
          'Fine-tuning the neural network on a few million text records',
          'Calling the LLM API only two or three times a day',
          'Restricting prompts to fewer than 10 words'
        ],
        correctOptionIndex: 0,
        explanation: 'Few-shot prompting provides contextual demonstrations of desired input-output behavior within the prompt itself, significantly improving accuracy on complex tasks without changing model weights.'
      },
      {
        id: 5,
        question: 'What is the Self-Attention mechanism in the Transformer architecture primarily responsible for?',
        options: [
          'Allowing the model to dynamically weigh the relevance of all other tokens in a sequence when processing a given token',
          'Compressing text into zip files',
          'Cleaning training data of profanity',
          'Synchronizing clock cycles across GPU chips'
        ],
        correctOptionIndex: 0,
        explanation: 'Self-attention calculates pairwise relationships between every token in a sentence, allowing the model to capture long-range dependencies and contextual nuance effectively.'
      }
    ]
  },

  'cloud-aws': {
    topicId: 'cloud-aws',
    title: 'AWS Cloud Architecture & Serverless',
    category: 'Cloud Computing',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What is the maximum execution timeout for an AWS Lambda function?',
        options: ['5 minutes', '15 minutes (900 seconds)', '1 hour', 'Unlimited'],
        correctOptionIndex: 1,
        explanation: 'AWS Lambda has a hard execution timeout limit of 15 minutes (900 seconds). For tasks running longer, services like AWS ECS, Fargate, or AWS Step Functions are recommended.'
      },
      {
        id: 2,
        question: 'Which AWS service provides an enterprise managed distributed NoSQL key-value database with single-digit millisecond latency at any scale?',
        options: ['Amazon Aurora', 'Amazon DynamoDB', 'Amazon Redshift', 'Amazon Neptune'],
        correctOptionIndex: 1,
        explanation: 'Amazon DynamoDB is a fully managed NoSQL key-value and document database service that provides predictable single-digit millisecond performance and automatic scaling.'
      },
      {
        id: 3,
        question: 'In AWS IAM, what principle dictates that users and services should only be granted permissions strictly necessary to accomplish their tasks?',
        options: [
          'Principle of Least Privilege (PoLP)',
          'Principle of High Availability',
          'Zero Latency Rule',
          'Open Access Standard'
        ],
        correctOptionIndex: 0,
        explanation: 'The Principle of Least Privilege states that every module, user, and service should only possess the minimum set of permissions needed to perform its intended job.'
      },
      {
        id: 4,
        question: 'Which AWS service acts as a fully managed content delivery network (CDN) to securely deliver web content and APIs with low latency globally?',
        options: ['Amazon CloudFront', 'AWS Route 53', 'AWS Direct Connect', 'Amazon SQS'],
        correctOptionIndex: 0,
        explanation: 'Amazon CloudFront is a global CDN service that speeds up distribution of static and dynamic web content by caching it at edge locations worldwide.'
      },
      {
        id: 5,
        question: 'What is the primary difference between Amazon SQS and Amazon SNS?',
        options: [
          'SQS is a pull-based point-to-point message queuing service; SNS is a push-based pub/sub notification service',
          'SQS stores images; SNS stores relational databases',
          'SQS requires EC2 instances; SNS only runs on Lambda',
          'SQS is deprecated in favor of SNS'
        ],
        correctOptionIndex: 0,
        explanation: 'Amazon SQS is a distributed message queue where consumers pull messages. Amazon SNS is a publisher/subscriber service that pushes notifications to multiple subscribers simultaneously.'
      }
    ]
  },

  'kubernetes-k8s': {
    topicId: 'kubernetes-k8s',
    title: 'Kubernetes Container Orchestration',
    category: 'Cloud & DevOps',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What is the smallest deployable computing unit that you can create and manage in Kubernetes?',
        options: ['A Pod', 'A Node', 'A Deployment', 'A Service'],
        correctOptionIndex: 0,
        explanation: 'A Pod is the smallest execution unit in Kubernetes. It encapsulates one or more containers that share storage, network IP, and specifications for how to run.'
      },
      {
        id: 2,
        question: 'Which Kubernetes controller is responsible for ensuring that a specified number of pod replicas are running at any given time?',
        options: ['ReplicaSet / Deployment', 'Ingress Controller', 'Kube-proxy', 'Etcd'],
        correctOptionIndex: 0,
        explanation: 'A ReplicaSet (managed by a Deployment) maintains a stable set of replica Pods running at any given time, automatically replacing failed or terminated pods.'
      },
      {
        id: 3,
        question: 'What is the function of the Kubernetes Horizontal Pod Autoscaler (HPA)?',
        options: [
          'It automatically scales the number of pod replicas up or down based on CPU utilization or custom application metrics',
          'It adds physical RAM sticks to worker nodes',
          'It modifies DNS records on domain registrars',
          'It deploys new Kubernetes cluster masters'
        ],
        correctOptionIndex: 0,
        explanation: 'HPA automatically updates a workload resource (like a Deployment) to match demand by scaling the number of Pod replicas based on observed CPU/memory utilization or custom metrics.'
      },
      {
        id: 4,
        question: 'What is the purpose of a Kubernetes Ingress object?',
        options: [
          'To manage external HTTP/HTTPS routing and SSL termination to services within the cluster',
          'To store secret passwords in plaintext',
          'To compile Go binaries into Docker images',
          'To format hard drives on worker nodes'
        ],
        correctOptionIndex: 0,
        explanation: 'An Ingress manages external access to the services in a cluster, typically HTTP/HTTPS, providing load balancing, SSL termination, and name-based virtual hosting.'
      },
      {
        id: 5,
        question: 'Where is the entire persistent state, configuration, and cluster metadata stored in a Kubernetes control plane?',
        options: ['etcd', 'Redis', 'SQLite', 'Ceph'],
        correctOptionIndex: 0,
        explanation: 'etcd is a consistent, highly-available distributed key-value store used as Kubernetes backing store for all cluster data and state.'
      }
    ]
  },

  'cybersecurity': {
    topicId: 'cybersecurity',
    title: 'Cyber Security, OWASP & Web Security',
    category: 'Security & Compliance',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What is the most effective defense against SQL Injection vulnerabilities in backend applications?',
        options: [
          'Using Parameterized Queries / Prepared Statements or reputable ORMs rather than concatenating user input into SQL strings',
          'Hashing the entire SQL query with MD5',
          'Running the database on a non-standard port like 5433',
          'Limiting user passwords to 8 characters'
        ],
        correctOptionIndex: 0,
        explanation: 'Parameterized queries ensure the database driver treats user input strictly as data, never as executable SQL command syntax, completely eliminating SQL injection vectors.'
      },
      {
        id: 2,
        question: 'Which cookie attribute prevents client-side JavaScript (e.g. document.cookie) from accessing session tokens, mitigating XSS token theft?',
        options: ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/'],
        correctOptionIndex: 0,
        explanation: 'The HttpOnly flag forbids JavaScript from accessing the cookie via document.cookie, making it impossible for Cross-Site Scripting (XSS) scripts to directly steal the session cookie.'
      },
      {
        id: 3,
        question: 'What attack occurs when a malicious website tricks an authenticated user browser into executing unwanted actions on another trusted site?',
        options: [
          'Cross-Site Request Forgery (CSRF)',
          'Man-in-the-Middle (MITM)',
          'Denial of Service (DoS)',
          'Privilege Escalation'
        ],
        correctOptionIndex: 0,
        explanation: 'CSRF forces an end user to execute unwanted actions on a web application in which they are currently authenticated, typically defeated by using anti-CSRF tokens and SameSite cookies.'
      },
      {
        id: 4,
        question: 'What cryptographic algorithm family is recommended for hashing user passwords securely with work factor (salt + slow computation)?',
        options: ['bcrypt, Argon2, or PBKDF2', 'MD5', 'SHA-1', 'Base64'],
        correctOptionIndex: 0,
        explanation: 'Adaptive password hashing functions like Argon2, bcrypt, and PBKDF2 incorporate automatic salts and adjustable computational cost to resist brute-force GPU attacks.'
      },
      {
        id: 5,
        question: 'What HTTP response header restricts the browser from rendering a page within an <iframe> to prevent Clickjacking attacks?',
        options: ['X-Frame-Options: DENY / SAMEORIGIN', 'Content-Encoding: gzip', 'Strict-Transport-Security', 'Access-Control-Allow-Origin'],
        correctOptionIndex: 0,
        explanation: 'X-Frame-Options (or CSP frame-ancestors) instructs the browser whether the page is allowed to be rendered in an iframe, frame, or object, preventing Clickjacking overlays.'
      }
    ]
  },

  'data-engineering': {
    topicId: 'data-engineering',
    title: 'Data Engineering, Apache Spark & Kafka',
    category: 'Big Data & Analytics',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'Why is Apache Parquet widely favored over CSV and JSON for big data analytics warehouses and data lakes?',
        options: [
          'It is a columnar, compressed binary storage format that enables column projection and predicate pushdown, drastically reducing I/O',
          'It can be opened and edited directly in Windows Notepad',
          'It is the only file format supported by Python',
          'It compresses audio and video streams losslessly'
        ],
        correctOptionIndex: 0,
        explanation: 'Parquet stores data by column rather than row. When queries select only 3 out of 100 columns, Parquet reads only those 3 columns from disk, dramatically accelerating analytics.'
      },
      {
        id: 2,
        question: 'In Apache Kafka, what is a Consumer Group?',
        options: [
          'A set of consumers that cooperate to read from a topic, where each partition is consumed by only one consumer in the group, enabling parallel scale-out',
          'A list of user accounts with read-only access to Kafka topics',
          'A firewall rule restricting external IPs from connecting to Kafka',
          'A backup cluster in another cloud region'
        ],
        correctOptionIndex: 0,
        explanation: 'Consumer groups allow Kafka to distribute topic partitions across multiple consumer instances, enabling high-throughput parallel data processing.'
      },
      {
        id: 3,
        question: 'In Apache Spark, what is the key difference between a Transformation (e.g. .filter(), .map()) and an Action (e.g. .count(), .collect())?',
        options: [
          'Transformations are lazily evaluated and build an execution DAG; Actions trigger the actual computation across cluster executors',
          'Transformations write directly to disk; Actions delete cached data',
          'Transformations only work on numeric data; Actions work on strings',
          'Transformations run exclusively on the driver node'
        ],
        correctOptionIndex: 0,
        explanation: 'Spark transformations are lazy: Spark records operations in a Directed Acyclic Graph (DAG) and only executes them when an action produces a concrete output or writes data.'
      },
      {
        id: 4,
        question: 'What is the purpose of a Schema Registry in an event-driven Kafka architecture (e.g., using Apache Avro)?',
        options: [
          'To enforce schema compatibility and prevent producer services from emitting breaking message changes that crash downstream consumers',
          'To generate SQL passwords for Kafka users',
          'To balance network traffic between Kafka brokers',
          'To convert JSON messages into XML format'
        ],
        correctOptionIndex: 0,
        explanation: 'Schema Registry serves as a centralized repository for schemas and validates message compatibility rules, preventing breaking data contract changes in production pipelines.'
      },
      {
        id: 5,
        question: 'In data pipeline architectures, what does the term idempotency ensure in ETL/ELT pipelines?',
        options: [
          'Re-running a pipeline batch or backfill produces identical data without generating duplicate rows or corrupted aggregates',
          'The pipeline executes in under 1 second',
          'No disk space is consumed during processing',
          'All columns are converted to lowercase'
        ],
        correctOptionIndex: 0,
        explanation: 'Idempotent pipelines allow data engineers to safely replay failed jobs or re-run historical backfills without producing duplicate records or distorted financial totals.'
      }
    ]
  },

  'machine-learning': {
    topicId: 'machine-learning',
    title: 'Machine Learning, Scikit-Learn & PyTorch',
    category: 'AI & Machine Learning',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What phenomenon occurs when a machine learning model performs exceptionally well on training data but poorly on unseen test data?',
        options: ['Overfitting', 'Underfitting', 'Data Drift', 'Gradient Exploding'],
        correctOptionIndex: 0,
        explanation: 'Overfitting occurs when a model learns the noise and details of the training data to the extent that it negatively impacts its ability to generalize to new data.'
      },
      {
        id: 2,
        question: 'Which technique is commonly used to prevent overfitting in deep neural networks by randomly zeroing out neuron outputs during training?',
        options: ['Dropout', 'Softmax', 'Batch Normalization', 'One-Hot Encoding'],
        correctOptionIndex: 0,
        explanation: 'Dropout randomly deactivates a fraction of neurons during each training step, preventing complex co-adaptations and acting as a powerful regularizer.'
      },
      {
        id: 3,
        question: 'In binary classification with highly imbalanced datasets (e.g., fraud detection with 99.9% negative cases), why is raw Accuracy a misleading metric?',
        options: [
          'A trivial model predicting 100% negative achieves 99.9% accuracy while catching zero fraud cases; Precision, Recall, and F1-score are needed',
          'Accuracy is impossible to compute with floating point numbers',
          'Scikit-learn crashes when computing accuracy on imbalanced classes',
          'Accuracy only applies to regression problems'
        ],
        correctOptionIndex: 0,
        explanation: 'When one class heavily dominates, a naive baseline that always guesses the majority class gets high accuracy but zero utility. Precision, Recall, and PR-AUC give true insight.'
      },
      {
        id: 4,
        question: 'In PyTorch, what method call on a loss tensor computes gradients for all parameters with requires_grad=True using backpropagation?',
        options: ['loss.backward()', 'loss.forward()', 'optimizer.step()', 'model.eval()'],
        correctOptionIndex: 0,
        explanation: 'loss.backward() traverses the dynamic computational graph and computes the derivative of the loss with respect to all graph leaves (model weights).'
      },
      {
        id: 5,
        question: 'What is the purpose of K-Fold Cross Validation in model evaluation?',
        options: [
          'It splits the dataset into K subsets, iteratively training on K-1 folds and validating on the remaining fold to get an unbiased performance estimate',
          'It multiplies the dataset size by K times',
          'It reduces the number of features to K dimensions',
          'It trains K separate neural networks to run in parallel'
        ],
        correctOptionIndex: 0,
        explanation: 'K-Fold Cross Validation ensures that every data point gets a chance to be in both training and test sets, reducing variance in performance evaluation.'
      }
    ]
  },

  'nodejs-microservices': {
    topicId: 'nodejs-microservices',
    title: 'Node.js, Express & Microservices',
    category: 'Backend Engineering',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'How does the Node.js single-threaded event loop handle thousands of concurrent I/O operations without blocking?',
        options: [
          'It delegates asynchronous I/O tasks to the operating system kernel or the libuv thread pool, firing callbacks when ready',
          'It spawns a new OS process for every incoming HTTP request',
          'It compiles JavaScript into native C++ machine code before every request',
          'It uses hardware hyperthreading inside V8'
        ],
        correctOptionIndex: 0,
        explanation: 'Node.js uses non-blocking system calls and libuv. When I/O operations complete, their completion events are pushed to the event loop callback queues without blocking main execution.'
      },
      {
        id: 2,
        question: 'In Express middleware functions, what happens if neither next() is called nor a response (res.send/res.json) is returned?',
        options: [
          'The incoming client request hangs indefinitely until the client times out',
          'Express automatically sends an HTTP 200 OK',
          'The server crashes with an uncaught exception',
          'Express redirects the user to the home page'
        ],
        correctOptionIndex: 0,
        explanation: 'Middleware in Express must either pass control to the next middleware via next() or end the request-response cycle. Otherwise the request remains pending until socket timeout.'
      },
      {
        id: 3,
        question: 'What is the purpose of the Node.js cluster module or tools like PM2 in production?',
        options: [
          'To fork multiple worker processes across CPU cores to utilize multi-core server hardware and share server ports',
          'To connect to Apache Cassandra clusters',
          'To bundle frontend assets with Webpack',
          'To encrypt environment variables'
        ],
        correctOptionIndex: 0,
        explanation: 'Since single Node.js instances run on one thread, the cluster module or PM2 forks worker processes to scale across all CPU cores and balance incoming TCP traffic.'
      },
      {
        id: 4,
        question: 'What is the Circuit Breaker pattern used for in microservice architectures?',
        options: [
          'To detect failures and prevent an application from repeatedly performing an operation bound to fail, giving failing downstream services time to recover',
          'To shut down the entire data center in case of power surge',
          'To break up large monolithic files into micro-modules',
          'To enforce rate limiting per IP address'
        ],
        correctOptionIndex: 0,
        explanation: 'A circuit breaker trips open after a threshold of downstream failures, returning immediate fallback responses and stopping cascading failures across microservices.'
      },
      {
        id: 5,
        question: 'Which method should be used to listen for unhandled asynchronous promise rejections globally in Node.js?',
        options: [
          "process.on('unhandledRejection', handler)",
          "window.onerror",
          "try { ... } catch",
          "process.on('SIGTERM', handler)"
        ],
        correctOptionIndex: 0,
        explanation: "process.on('unhandledRejection') captures any rejected promise that has no .catch() handler attached, allowing structured logging or graceful shutdown."
      }
    ]
  },

  'typescript-advanced': {
    topicId: 'typescript-advanced',
    title: 'Advanced TypeScript & Type Systems',
    category: 'Frontend & Fullstack',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: "What is the difference between 'unknown' and 'any' types in TypeScript?",
        options: [
          "'unknown' is type-safe: you cannot invoke methods or access properties on it without first performing type narrowing or assertion",
          "'unknown' is only available in JavaScript, not TypeScript",
          "'any' enforces strict compile-time checks while 'unknown' disables them",
          "There is no difference; they are aliases"
        ],
        correctOptionIndex: 0,
        explanation: "'unknown' is the type-safe counterpart of 'any'. Anything is assignable to 'unknown', but TypeScript forces you to narrow the type (e.g. typeof, instanceof) before performing operations."
      },
      {
        id: 2,
        question: 'What is a Discriminated Union (Tagged Union) in TypeScript?',
        options: [
          'A union of object types that all share a common literal property used by TypeScript to narrow down the specific type in a switch/if block',
          'A union of database tables',
          'A type that can only hold numbers or strings',
          'A compiler flag that prohibits any union types'
        ],
        correctOptionIndex: 0,
        explanation: 'A discriminated union uses a single common literal field (like type: "SUCCESS" | "ERROR") to allow TypeScript to exhaustively narrow types inside conditionals.'
      },
      {
        id: 3,
        question: "What does the utility type Partial<T> construct in TypeScript?",
        options: [
          'A type with all properties of T set to optional (?)',
          'A type with all properties of T set to readonly',
          'A type that removes all null or undefined values',
          'A type containing only the first half of properties'
        ],
        correctOptionIndex: 0,
        explanation: 'Partial<T> creates a new type with every property of T marked as optional, allowing updates or subsets of the original object.'
      },
      {
        id: 4,
        question: "What does the 'never' type represent in TypeScript?",
        options: [
          'Values that never occur (e.g., the return type of a function that always throws an error or enters an infinite loop)',
          'A type that accepts any value including null',
          'A deprecated keyword replaced by void',
          'A type for variables that can never be garbage collected'
        ],
        correctOptionIndex: 0,
        explanation: "'never' indicates values that can never occur. It is also used in exhaustive type checking to ensure all cases in a discriminated union switch statement are handled."
      },
      {
        id: 5,
        question: "What does the 'keyof' operator produce when applied to an interface or object type?",
        options: [
          'A union of string and numeric literal types representing the known public property names of that type',
          'An array of property values at runtime',
          'A boolean indicating if the object is empty',
          'The cryptographic key of the TypeScript file'
        ],
        correctOptionIndex: 0,
        explanation: "keyof T yields a union of literal types representing all keys of T. For example, keyof { id: number; name: string } is 'id' | 'name'."
      }
    ]
  },

  'uiux-design': {
    topicId: 'uiux-design',
    title: 'UI/UX Design Systems, Figma & Usability',
    category: 'Product & Design',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'According to WCAG 2.1 Level AA, what is the minimum contrast ratio required for normal body text against its background?',
        options: ['4.5:1', '3:1', '7:1', '2:1'],
        correctOptionIndex: 0,
        explanation: 'WCAG 2.1 AA requires a minimum contrast ratio of 4.5:1 for normal text (under 18pt / 14pt bold) to ensure readability for users with moderate visual impairments.'
      },
      {
        id: 2,
        question: 'What is a Design Token in modern design systems (e.g., Tailwind, Material Design, Figma)?',
        options: [
          'A named semantic entity that stores visual design attributes (colors, spacing, typography scales) in platform-agnostic JSON/variables',
          'A cryptocurrency used to buy Figma plugins',
          'A physical badge awarded to UX researchers',
          'A JWT token used for authenticating design files'
        ],
        correctOptionIndex: 0,
        explanation: 'Design tokens are the visual design atoms of the design system (e.g., color-primary: #0077b5). They store design decisions in a format consumed by Figma, CSS, iOS, and Android alike.'
      },
      {
        id: 3,
        question: "What does Fitts's Law predict in user interface interaction design?",
        options: [
          'The time required to rapidly move to a target area is a function of the ratio between the distance to the target and the width of the target',
          'Users spend most of their time on other websites, so your site should work similarly',
          'Colors evoke emotional responses in users',
          'Every page must load in under 2 seconds'
        ],
        correctOptionIndex: 0,
        explanation: "Fitts's Law dictates that larger and closer interactive targets (like primary call-to-action buttons) are significantly faster and easier for users to click or tap."
      },
      {
        id: 4,
        question: 'In Figma, what feature allows elements to dynamically adjust their sizing, padding, and layout flow when content changes, behaving like CSS Flexbox?',
        options: ['Auto Layout', 'Smart Animate', 'Boolean Groups', 'Component Variants'],
        correctOptionIndex: 0,
        explanation: 'Figma Auto Layout replicates CSS Flexbox behavior, enabling buttons and lists to dynamically grow, shrink, and wrap as text content or screen widths change.'
      },
      {
        id: 5,
        question: 'What is the primary objective of an A/B Test in product design and user research?',
        options: [
          'To compare two versions of a single variable (e.g., button color or copy) with randomized user cohorts to measure which statistically drives higher conversion',
          'To test an app on both Android and Apple devices',
          'To check if the application passes accessibility compliance',
          'To test backend database failover'
        ],
        correctOptionIndex: 0,
        explanation: 'A/B testing presents two variants (A and B) to randomized user traffic to determine with statistical significance which design variation improves a key target KPI.'
      }
    ]
  },

  'product-management': {
    topicId: 'product-management',
    title: 'Tech Product Management & Agile Scrum',
    category: 'Product & Strategy',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What does the RICE framework stand for when prioritizing product features and roadmap initiatives?',
        options: [
          'Reach, Impact, Confidence, Effort',
          'Revenue, Investment, Customers, Execution',
          'Retention, Innovation, Cost, Efficiency',
          'Risk, Iteration, Capacity, Engagement'
        ],
        correctOptionIndex: 0,
        explanation: 'RICE score = (Reach × Impact × Confidence) / Effort. It provides a standardized quantitative methodology to prioritize competing product backlog items.'
      },
      {
        id: 2,
        question: 'What constitutes a true Minimum Viable Product (MVP)?',
        options: [
          'The version of a new product which allows a team to collect the maximum amount of validated learning about customers with the least effort',
          'A half-finished buggy prototype with poor visual design',
          'A feature-complete product built over 2 years before speaking to users',
          'A slide deck with no software code'
        ],
        correctOptionIndex: 0,
        explanation: 'As defined by Eric Ries in Lean Startup, an MVP is the simplest product version that delivers genuine core value to validate or invalidate crucial customer hypotheses.'
      },
      {
        id: 3,
        question: 'What is a North Star Metric in growth and product strategy?',
        options: [
          'The single key metric that best captures the core value your product delivers to its customers and directly predicts sustainable long-term revenue',
          'The total number of page views on the homepage',
          'The stock price of the company at market close',
          'The number of employees hired in a fiscal quarter'
        ],
        correctOptionIndex: 0,
        explanation: 'A North Star Metric (e.g., Airbnb nights booked, Spotify listening hours) aligns the entire organization around delivering customer value that drives retention and growth.'
      },
      {
        id: 4,
        question: 'In Agile Scrum, what is the primary purpose of a Sprint Retrospective ceremony?',
        options: [
          'For the Scrum team to inspect how the last sprint went with regards to people, processes, and tools, and identify concrete improvements for the next sprint',
          'To demo software features to the executive board',
          'To assign blame for missed deadlines',
          'To plan the annual corporate financial budget'
        ],
        correctOptionIndex: 0,
        explanation: 'The Sprint Retrospective is a blameless continuous improvement meeting where the team reflects on what worked, what didn’t, and commits to actionable enhancements.'
      },
      {
        id: 5,
        question: 'What is the difference between a Product Output and a Product Outcome?',
        options: [
          'An output is what you build (features, lines of code, releases); an outcome is the measurable behavioral change in users and business impact that results',
          'An output is revenue; an outcome is marketing spend',
          'An output is designed by engineers; an outcome is designed by sales',
          'They are identical terms in Agile terminology'
        ],
        correctOptionIndex: 0,
        explanation: 'Great product teams measure outcomes (e.g. 15% reduction in checkout drop-off) rather than outputs (e.g. 3 new payment form fields launched).'
      }
    ]
  },

  'mobile-flutter': {
    topicId: 'mobile-flutter',
    title: 'Flutter & Cross-Platform Mobile Dev',
    category: 'Mobile Engineering',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'How does Flutter render UI onto the screen compared to React Native?',
        options: [
          'Flutter draws its own pixels directly onto a canvas using its Skia/Impeller rendering engine, without using native OEM platform widgets',
          'Flutter converts all Dart code into native Swift/Kotlin views using an interpretive JavaScript bridge',
          'Flutter runs inside an embedded hidden WebKit WebView',
          'Flutter only runs on Android devices'
        ],
        correctOptionIndex: 0,
        explanation: 'Flutter ships its own graphics rendering engine (Impeller/Skia). Instead of bridging to native OS widgets, Flutter renders every pixel directly, ensuring identical 60/120fps UI across all platforms.'
      },
      {
        id: 2,
        question: 'What is the difference between a StatelessWidget and a StatefulWidget in Flutter?',
        options: [
          'A StatelessWidget is immutable and never rebuilds based on internal state changes; a StatefulWidget maintains a mutable State object that calls setState() to trigger re-renders',
          'StatelessWidgets cannot have any child widgets',
          'StatefulWidgets can only be used on iOS devices',
          'StatelessWidgets consume more memory than StatefulWidgets'
        ],
        correctOptionIndex: 0,
        explanation: 'StatelessWidget does not hold mutable state over time. StatefulWidget creates a State object which holds data and triggers rebuilds when setState() is called.'
      },
      {
        id: 3,
        question: 'In Dart, what mechanism allows heavy CPU-intensive operations (e.g. image filtering, large JSON parsing) to run on a background thread without freezing the UI?',
        options: ['Isolates', 'Async/Await on main thread', 'SetTimeout', 'Web Workers'],
        correctOptionIndex: 0,
        explanation: 'Dart is single-threaded per Isolate. To do heavy background computation without dropping UI frames, you spawn an Isolate which runs in separate memory and communicates via message passing.'
      },
      {
        id: 4,
        question: 'Which method in a Flutter State class is called exactly once when the StatefulWidget is first inserted into the widget tree?',
        options: ['initState()', 'build()', 'didUpdateWidget()', 'dispose()'],
        correctOptionIndex: 0,
        explanation: 'initState() is called once when the state object is created. It is the designated location for initializing controllers, subscriptions, or animations.'
      },
      {
        id: 5,
        question: 'What is a Platform Channel (MethodChannel) used for in Flutter?',
        options: [
          'To communicate asynchronously between Dart code and host platform native code (Kotlin/Java on Android, Swift/Obj-C on iOS)',
          'To stream video files over YouTube channels',
          'To update Flutter SDK versions automatically',
          'To distribute apps on the Google Play Store'
        ],
        correctOptionIndex: 0,
        explanation: 'Platform channels send messages between Flutter Dart code and native platform code, allowing Flutter apps to access native device APIs like Bluetooth, sensors, or native camera controls.'
      }
    ]
  },

  'blockchain-web3': {
    topicId: 'blockchain-web3',
    title: 'Web3, Solidity & Smart Contract Security',
    category: 'Blockchain & Web3',
    durationMinutes: 5,
    passingScorePercentage: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'What is a Reentrancy Attack in Solidity smart contracts, and what is the standard architectural fix?',
        options: [
          'An external contract hijacks execution during a balance withdrawal before internal state is updated; fixed by using the Checks-Effects-Interactions pattern or ReentrancyGuard',
          'A hacker guesses the private key of the contract owner; fixed by using longer passwords',
          'A transaction running out of gas; fixed by increasing the block gas limit',
          'A compiler bug in Solidity 0.8; fixed by downgrading to 0.4'
        ],
        correctOptionIndex: 0,
        explanation: 'In reentrancy, an external fallback function calls back into the vulnerable contract before the victim contract updates state balances. Updating state before transferring ETH (Checks-Effects-Interactions) prevents it.'
      },
      {
        id: 2,
        question: 'What is the purpose of Gas in the Ethereum blockchain network?',
        options: [
          'A fee unit that measures the computational and storage effort required to execute transactions, preventing infinite loops and spamming the EVM',
          'A physical fuel used to cool Ethereum mining rigs',
          'A token that replaces ETH on layer 2 networks',
          'An encryption key used in zero-knowledge proofs'
        ],
        correctOptionIndex: 0,
        explanation: 'Gas pricing ensures Ethereum Turing-complete Virtual Machine cannot be crashed by infinite loops, as every opcode consumes a fixed amount of gas until the transaction gas limit runs out.'
      },
      {
        id: 3,
        question: 'Which Ethereum token standard defines the interface for Non-Fungible Tokens (unique digital assets/NFTs)?',
        options: ['ERC-721', 'ERC-20', 'ERC-777', 'ERC-4626'],
        correctOptionIndex: 0,
        explanation: 'ERC-721 is the free, open standard that describes how to build non-fungible or unique tokens on the Ethereum blockchain, in contrast to fungible tokens defined by ERC-20.'
      },
      {
        id: 4,
        question: 'What is a Layer-2 Rollup (e.g., Arbitrum, Optimism, zkSync) designed to accomplish?',
        options: [
          'Process transactions off the Ethereum mainnet in batches and post cryptographic proofs back to Layer 1, providing massive scalability and low transaction fees while inheriting L1 security',
          'Replace the Bitcoin proof of work network',
          'Store large video files decentralized across IPFS',
          'Provide free broadband internet to crypto users'
        ],
        correctOptionIndex: 0,
        explanation: 'Rollups execute hundreds of transactions off-chain, compress the data, and submit proofs back to the Layer 1 Ethereum mainnet, providing sub-cent fees with Ethereum security.'
      },
      {
        id: 5,
        question: "In Solidity 0.8.0 and above, what happens automatically when an arithmetic operation results in an integer overflow or underflow without the 'unchecked' block?",
        options: [
          'The transaction reverts with an error, preventing silent overflow bugs without needing OpenZeppelin SafeMath',
          'The number silently wraps around from 255 back to 0',
          'The contract destroys itself via selfdestruct',
          'The node crashes with a segmentation fault'
        ],
        correctOptionIndex: 0,
        explanation: 'Starting with Solidity 0.8.0, the compiler includes built-in overflow and underflow checks that automatically revert transactions on arithmetic overflow, eliminating the need for SafeMath.'
      }
    ]
  }
};
