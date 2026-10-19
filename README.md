# DeutschWelt — German Learning & Coaching Platform

> **"Your journey to German fluency."**  
> A full-stack, production-ready German-language learning and coaching platform covering CEFR levels **A1 to B2**, complete with student learning tools, a spaced-repetition vocabulary trainer, an interactive audio speaking lab, a teacher coaching workspace, and administrative oversight.

---

## Table of Contents
1. [Product Overview](#product-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Monorepo Structure](#architecture--monorepo-structure)
4. [Design System & Visual Identity](#design-system--visual-identity)
5. [Demo Accounts & Credentials](#demo-accounts--credentials)
6. [Getting Started & Local Setup](#getting-started--local-setup)
7. [Running with Docker Compose](#running-with-docker-compose)
8. [Database Schema & Prisma](#database-schema--prisma)
9. [REST API Documentation](#rest-api-documentation)
10. [Testing Suite](#testing-suite)
11. [Production Deployment](#production-deployment)
12. [License](#license)

---

## 1. Product Overview

DeutschWelt combines the structured methodology of a premier German language institute with modern European ed-tech software design.

### Key Capabilities
- **Public Website & Marketing Portal:**
  - Modern hero section with animated CEFR roadmap and interactive vocabulary preview.
  - Comprehensive course catalog (A1, A2, B1, B2) with syllabus breakdown, CEFR exam goals (Goethe-Zertifikat, TestDaF), and prerequisite mapping.
  - About Us, Contact & Batch Enquiry system, FAQ, Privacy Policy, and Terms of Service.
- **Authentication & Security:**
  - Secure session-based authentication using HTTP-only, SameSite cookies.
  - Strong password hashing with modern cryptography.
  - Expiring password reset workflow and email verification token architecture.
  - Role-based authorization across **Student**, **Teacher**, and **Administrator** roles.
  - Helmet security headers, CORS origin enforcement, and rate limiting on API endpoints.
- **Student Learning Experience:**
  - **Student Dashboard:** Real-time metrics including learning streak counter, daily study goal progress, vocabulary mastered count, and 1-click "Continue Learning" action.
  - **Lesson Player:** Structured curriculum with rich text blocks, key takeaway sidebars, grammar summary cards, audio player with interactive transcript toggle, and server-graded comprehension exercises.
  - **Vocabulary Trainer:** 5-Box Leitner Spaced-Repetition System (SRS). Visual 3D flipcards, pronunciation hints, example German/English sentences, and colour-coded noun gender badges (`der` blue, `die` red, `das` green, `die (pl)` amber).
  - **Speaking Lab:** In-browser audio recording using the HTML5 `MediaRecorder` API with waveform animation, live timer, instant playback, audio file uploads, and teacher feedback with rubrics.
  - **Assignments & Homework:** Submission portal for writing tasks and mock exam practice with draft auto-save and teacher grading.
- **Teacher Coaching Workspace:**
  - **Teacher Dashboard:** Cohort analytics, pending grading count, active batch tracking, and average student completion rates.
  - **Batch & Student Management:** View enrolled students, CEFR progress distribution, and batch details.
  - **Submissions & Audio Grading Queue:** Review student essays and listen to recorded speaking submissions. Assign rubric scores (Grammar, Vocabulary, Pronunciation, Coherence) and write detailed qualitative feedback.
  - **Assignment Creator:** Create structured homework with deadlines, submission types (Text/Audio), and batch targeting.
- **Administrative Portal:**
  - **Admin Analytics Dashboard:** System telemetry charts (Enrollments by Level, Weekly Activity) powered by Recharts.
  - **Student & Teacher Management:** Searchable user tables, role assignments, activation status toggles, and one-click student CSV export.
  - **Course Management:** Curriculum authoring, unit and lesson organization, and publication controls.
  - **Enquiry Inbox:** Triage public prospective student inquiries, update status, and track consultation notes.
  - **System Settings & Audit Log:** Configure institute contact details, platform defaults, and view immutable audit logs.

---

## 2. Technology Stack

### Frontend (`apps/web`)
- **React 18** with **TypeScript** and **Vite**
- **Tailwind CSS** with a custom editorial design system
- **React Router v6** for client-side routing and protected layout guards
- **TanStack Query (React Query v5)** for server state synchronization and caching
- **React Hook Form** + **Zod** for schema-validated forms
- **Framer Motion** for restrained, educational micro-interactions
- **Lucide React** for accessible, clean iconography
- **Recharts** for administrative analytics and student progress charts

### Backend (`apps/api`)
- **Node.js** (v18+) & **Express.js** with TypeScript
- **Prisma ORM** with **PostgreSQL**
- Dual data layer: Connects directly to PostgreSQL with Prisma, with a resilient in-memory fallback store (`services/store.ts`) ensuring immediate out-of-the-box local execution even without an external database instance.
- **Argon2 / BCrypt** password hashing
- **Cookie-Parser** with HTTP-only, secure session cookies
- **Multer** for audio and media upload handling
- **Helmet**, **CORS**, and **express-rate-limit** for defensive API security
- **Morgan** structured request logging

### Shared Library (`packages/shared`)
- Canonical TypeScript types, interfaces, and enums (`UserRole`, `GermanLevel`, `GermanArticle`, `PartOfSpeech`, `ExerciseType`, `SubmissionStatus`).
- Universal Zod validation schemas for registration, login, course creation, exercise submission, and contact enquiries.

### Testing
- **Vitest** for API unit and integration tests
- Automated monorepo test suite running **26 passing tests** across `@deutschwelt/shared`, `@deutschwelt/api`, and `@deutschwelt/web`.

---

## 3. Architecture & Monorepo Structure

```
deutschwelt/
├── apps/
│   ├── api/                           # Express.js REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Complete 32-model relational schema
│   │   │   └── seed.ts                # A1-B2 curriculum, users, and vocab seed
│   │   ├── src/
│   │   │   ├── config/                # Environment and app configuration
│   │   │   ├── middleware/            # Auth guard, role check, rate limiter
│   │   │   ├── modules/               # Domain-specific route controllers
│   │   │   │   ├── admin/             # Analytics, user CRUD, settings, audit
│   │   │   │   ├── assignments/       # Homework submissions and grading
│   │   │   │   ├── auth/              # Registration, login, password reset
│   │   │   │   ├── courses/           # Course catalog and enrollments
│   │   │   │   ├── enquiries/         # Public contact form processing
│   │   │   │   ├── exercises/         # Server-side exercise evaluation engine
│   │   │   │   ├── lessons/           # Curriculum content blocks & progress
│   │   │   │   ├── speaking/          # Prompts, audio uploads & reviews
│   │   │   │   ├── student/           # Student dashboard metrics & profile
│   │   │   │   ├── teacher/           # Teacher batches & submission grading
│   │   │   │   └── vocabulary/        # Leitner SRS vocabulary trainer
│   │   │   ├── services/              # Prisma client & resilient store
│   │   │   ├── utils/                 # Password hasher, token generators
│   │   │   ├── __tests__/             # API & grading engine test suite
│   │   │   ├── app.ts                 # Express application setup
│   │   │   └── server.ts              # HTTP server entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                           # Vite + React 18 Frontend
│       ├── src/
│       │   ├── components/            # Reusable accessible UI components
│       │   │   ├── brand/             # DeutschWelt Logo and wordmark
│       │   │   └── ui/                # Button, Card, Badge, Modal, Input, etc.
│       │   ├── context/               # AuthContext session provider
│       │   ├── layouts/               # PublicLayout & DashboardLayout
│       │   ├── lib/                   # API client, cn helper, article formatter
│       │   ├── pages/                 # Full-fidelity page implementations
│       │   │   ├── admin/             # Dashboard, Students, Teachers, Courses, etc.
│       │   │   ├── auth/              # Login, Register, Forgot Password
│       │   │   ├── public/            # Home, Courses, About, Contact, FAQ, Legal
│       │   │   ├── student/           # Dashboard, LessonPlayer, VocabTrainer, etc.
│       │   │   └── teacher/           # Dashboard, Submissions, Batches, Homework
│       │   ├── styles/                # Tailwind styles & theme variables
│       │   ├── __tests__/             # Web unit tests
│       │   ├── App.tsx                # Route definitions & protected guards
│       │   └── main.tsx               # Client bootstrap
│       ├── package.json
│       ├── tailwind.config.js
│       └── vite.config.ts
│
├── packages/
│   └── shared/                        # Shared contracts between Web and API
│       ├── src/
│       │   ├── constants/             # Leitner SRS intervals & defaults
│       │   ├── schemas/               # Zod validation schemas
│       │   └── types/                 # CEFR, Role, and Entity types
│       ├── dist/                      # Compiled ESM exports
│       ├── test.js                    # Contract validation test suite
│       └── package.json
│
├── docker-compose.yml                 # Local PostgreSQL container service
├── package.json                       # Monorepo workspaces definition
├── tsconfig.base.json                 # Shared TypeScript compiler options
├── .env.example                       # Documented environment variables
└── README.md                          # Project documentation
```

---

## 4. Design System & Visual Identity

DeutschWelt features a refined aesthetic balancing academic prestige with modern clarity:

| Role / Element | Value / Token | Purpose |
| :--- | :--- | :--- |
| **Primary Navy** | `#17243A` | Navigation headers, dark headings, primary brand anchor |
| **German Red Accent** | `#D94747` | Calls to action, active tabs, streak badges, highlights |
| **Warm Ivory** | `#F5F1E8` | Page body background for high readability and low eye-strain |
| **Card White** | `#FFFFFF` | Structured content cards, modals, and input fields |
| **Text Primary** | `#202A39` | High-contrast body and editorial content |
| **Text Muted** | `#687386` | Secondary descriptions, timestamps, sub-labels |
| **Border Neutral** | `#E5E7EB` | Clean structural dividers |

### German Noun Gender Badge System
Articles are color-coded consistently across the vocabulary trainer, reading blocks, and quizzes:
- **`der` (Masculine):** Soft Blue (`#EFF6FF`, text `#1D4ED8`, border `#BFDBFE`)
- **`die` (Feminine):** Soft Red (`#FEF2F2`, text `#B91C1C`, border `#FECACA`)
- **`das` (Neuter):** Soft Green (`#ECFDF5`, text `#047857`, border `#A7F3D0`)
- **`die (pl)` (Plural):** Soft Amber (`#FFFBEB`, text `#B45309`, border `#FDE68A`)

---

## 5. Demo Accounts & Credentials

The platform is pre-configured with three role-based accounts. On the **Login page**, convenient one-click quick-fill buttons allow testing any role instantly:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Student** | `student@deutschwelt.de` | `StudentPass123!` | Access courses, lessons, exercises, Leitner SRS trainer, speaking lab, homework submissions, streak progress. |
| **Teacher** | `teacher@deutschwelt.de` | `TeacherPass123!` | Batch overview, student progress tracking, speaking audio review, homework grading with rubrics. |
| **Administrator** | `admin@deutschwelt.de` | `AdminPass123!` | Platform analytics telemetry, student/teacher accounts, course authoring, contact enquiry inbox, settings. |

---

## 6. Getting Started & Local Setup

### Prerequisites
- **Node.js** v18.0.0 or higher (`node -v`)
- **npm** v9.0.0 or higher (`npm -v`)
- (Optional) **Docker** & **Docker Compose** for running PostgreSQL locally

### 1. Clone & Install Dependencies
From the repository root:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://deutschwelt:deutschwelt_pass@localhost:5432/deutschwelt_db?schema=public
SESSION_SECRET=super-secret-session-key-at-least-32-chars-long!
RATE_LIMIT_MAX=100
```

### 3. Build the Shared Package
The shared schemas and types must be compiled before starting the application:
```bash
npm run --workspace=@deutschwelt/shared build
```

### 4. Database Setup (Optional if using PostgreSQL)
If PostgreSQL is running locally or via Docker:
```bash
# Push Prisma schema to the database
npm run --workspace=@deutschwelt/api db:push

# Seed A1-B2 curriculum, sample vocabulary, exercises, and demo users
npm run --workspace=@deutschwelt/api db:seed
```
*Note: If no PostgreSQL instance is detected, the API automatically falls back to its resilient internal store so all features work immediately out-of-the-box.*

### 5. Start Development Servers
Run both API and Web servers simultaneously from the root:
```bash
# Start backend API (http://localhost:5000)
npm run --workspace=@deutschwelt/api dev

# In a separate terminal, start frontend (http://localhost:5173)
npm run --workspace=@deutschwelt/web dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 7. Running with Docker Compose

To launch a containerized PostgreSQL database:
```bash
docker compose up -d postgres
```
To verify the container status:
```bash
docker compose ps
```
Once healthy, execute migrations and seeding:
```bash
npm run --workspace=@deutschwelt/api db:push
npm run --workspace=@deutschwelt/api db:seed
```

---

## 8. Database Schema & Prisma

The relational database model is declared in [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) and includes **32 models**:

- **Authentication & Users:** `User`, `StudentProfile`, `TeacherProfile`, `Session`, `PasswordResetToken`, `EmailVerificationToken`.
- **Courses & Curriculum:** `Course`, `CourseUnit`, `Lesson`, `LessonContentBlock`, `CoursePrerequisite`, `Enrollment`, `LessonProgress`.
- **Vocabulary & SRS Engine:** `VocabularyCategory`, `VocabularyWord`, `StudentVocabularyProgress`.
- **Interactive Exercises:** `Exercise`, `ExerciseQuestion`, `ExerciseOption`, `ExerciseAttempt`, `ExerciseAnswer`.
- **Speaking Lab:** `SpeakingPrompt`, `SpeakingAttempt`.
- **Assignments & Batches:** `Assignment`, `AssignmentSubmission`, `TeacherBatch`, `BatchMembership`, `TeacherBatchAssignment`.
- **System & Administration:** `Notification`, `ContactEnquiry`, `SiteSetting`, `AuditLog`.

---

## 9. REST API Documentation

All API endpoints are prefixed with `/api/v1` and return standard JSON responses:

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new student with level and goals |
| `POST` | `/auth/login` | Authenticate and issue secure session cookie |
| `POST` | `/auth/logout` | Revoke session and clear cookies |
| `GET` | `/auth/me` | Fetch currently authenticated user session |
| `POST` | `/auth/forgot-password` | Generate password reset token |
| `POST` | `/auth/reset-password` | Reset password using valid token |

### Courses & Lessons (`/api/v1/courses`, `/api/v1/lessons`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/courses` | List published courses with level filter |
| `GET` | `/courses/:slug` | Get course curriculum, units, and lessons |
| `POST` | `/courses/:id/enroll` | Enroll current student in a course |
| `GET` | `/lessons/:id` | Get full lesson content blocks and audio |
| `POST` | `/lessons/:id/complete` | Mark lesson completed and update progress |

### Exercises & Grading (`/api/v1/exercises`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/exercises/lesson/:lessonId` | Retrieve exercises associated with a lesson |
| `POST` | `/exercises/:id/submit` | Server-evaluated exercise grading with explanations |

### Vocabulary & Spaced Repetition (`/api/v1/vocabulary`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/vocabulary` | Search and filter words by level, gender, category |
| `GET` | `/vocabulary/due` | Retrieve words due for review under Leitner SRS |
| `POST` | `/vocabulary/:id/review` | Record recall quality (0-5) and advance Leitner box |

### Speaking Lab (`/api/v1/speaking`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/speaking/prompts` | List available speaking tasks with target phrases |
| `POST` | `/speaking/upload` | Multipart upload for recorded audio file |
| `POST` | `/speaking/attempts` | Submit speaking attempt with audio and notes |
| `GET` | `/speaking/my-attempts` | List student's past speaking submissions and reviews |

### Student & Teacher Workspaces (`/api/v1/student`, `/api/v1/teacher`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/student/dashboard` | Dashboard metrics: streak, study time, active lesson |
| `GET` | `/student/notifications` | Student notifications and feedback alerts |
| `GET` | `/teacher/dashboard` | Teacher dashboard: cohort size, grading backlog |
| `GET` | `/teacher/submissions` | Submissions awaiting teacher evaluation |
| `POST` | `/teacher/submissions/:id/grade` | Submit grade, score, and rubric feedback |
| `GET` | `/teacher/batches` | View assigned batches and student enrollments |

### Admin & System (`/api/v1/admin`, `/api/v1/enquiries`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/analytics` | High-level user, course, and enrollment metrics |
| `GET` | `/admin/students` | Manage registered students with CSV export |
| `GET` | `/admin/teachers` | Manage faculty accounts and batch assignments |
| `POST` | `/enquiries` | Submit public course inquiry or consultation request |
| `GET` | `/admin/enquiries` | Triage prospective student inquiries |

---

## 10. Testing Suite

The repository contains an automated test suite verifying types, schemas, backend logic, and frontend components:

```bash
# Run all tests across all monorepo packages
npm test
```

### Test Breakdown
- **`@deutschwelt/shared` (`test.js`):**
  - Enums and CEFR level consistency
  - Spaced Repetition (Leitner) interval constant math
  - Zod registration and password complexity validation
  - Login, contact enquiry, and vocabulary schema validation
- **`@deutschwelt/api` (`src/__tests__/*.test.ts`):**
  - **`srs.test.ts`:** Leitner box transitions (0-5 quality score progression, penalty box reset, due date calculation).
  - **`exercise.test.ts`:** Server-side grading engine for Multiple Choice, Fill-in-the-Blank, Word Reordering, and Matching questions with feedback rationale.
  - **`api.test.ts`:** Supertest integration tests for public endpoints, authentication rate-limiting, and registration schema protection.
- **`@deutschwelt/web` (`src/__tests__/*.test.ts`):**
  - Tailwind class merger (`cn`) unit tests
  - German article badge color and style resolver unit tests

To run typechecks without emitting JavaScript:
```bash
npm run typecheck --workspaces
```

---

## 11. Production Deployment

### Production Build
Compile all workspaces for production:
```bash
npm run build
```
This produces:
- `packages/shared/dist`: Compiled ESM modules and TypeScript definitions.
- `apps/api/dist`: Node.js server bundle.
- `apps/web/dist`: Static frontend bundle optimized with Vite.

### Self-Hosted VPS Deployment (e.g., Ubuntu / Debian)
1. **Reverse Proxy:** Configure Nginx or Caddy to proxy `/api` traffic to port `5000` and serve static files from `apps/web/dist`.
2. **Process Manager:** Run the API using PM2:
   ```bash
   pm2 start apps/api/dist/server.js --name deutschwelt-api
   ```
3. **Database:** Host PostgreSQL locally or on a private managed node.

---

## 12. License

This project was built for DeutschWelt language academy. All rights reserved.
