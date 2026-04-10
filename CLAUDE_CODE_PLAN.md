# Orthodox Saint Mary Church School — Full-Stack Web Application
## Comprehensive Development Plan for Claude Code

---

## 1. Architecture Decision: React + Supabase + Better Auth (Self-Hosted)

**Recommended Stack:**
- **Frontend:** React 19 + React Router v7 + TanStack Query + Tailwind CSS
- **Auth:** Supabase Auth (email, phone, OAuth providers) — self-hosted via GoTrue
- **Backend + Database:** Supabase (PostgreSQL + PostgREST + Realtime + Storage) — fully self-hosted
- **API Layer:** Express.js or Hono REST API server (handles business logic, auth middleware, notifications)
- **Notifications:** Node-cron scheduled jobs + self-hosted SMTP (email) + Twilio (SMS) + Web Push API
- **AI Chat:** Express route + Anthropic Claude API (for Orthodox faith Q&A assistant)
- **CMS:** Supabase-powered content management (blogs, events, fasting schedules, news)
- **Deployment:** Docker Compose (frontend Nginx + Supabase stack + API server)

**Why Supabase + Self-Hosting (not Convex Cloud + Clerk):**
- **Zero vendor lock-in:** PostgreSQL is the world's most popular open-source database
- **Full data ownership:** All data lives on your own infrastructure
- **Supabase open-source stack:** GoTrue (auth), PostgREST (REST API), Realtime (WebSockets), Storage — all Docker containers
- **Cost:** Free and open-source — only pay for your own server hardware/VPS
- **Scalable:** PostgreSQL handles millions of rows effortlessly; horizontal scaling with read replicas
- **Convex schema preserved:** The existing Convex schema maps 1:1 to PostgreSQL tables

**Why React + React Router over Next.js:**
- React Router v7 gives powerful routing with loaders/actions — no SSR overhead needed for a school app
- Supabase handles the entire backend: REST API via PostgREST, real-time subscriptions, auth, storage
- Supabase Auth UI components + custom sign-in/sign-up pages — no external auth dependency
- Tailwind CSS = rapid, beautiful, consistent UI

---

## 2. Project Structure

```
saint-mary-school/
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.convex       # (if self-hosting Convex)
│   └── docker-compose.yml
├── convex/
│   ├── _generated/
│   ├── schema.ts               # Database schema
│   ├── auth.ts                 # Clerk webhook + user sync
│   ├── users.ts                # User CRUD + role management
│   ├── students.ts             # Student enrollment + queries
│   ├── teachers.ts             # Teacher enrollment + queries
│   ├── parents.ts              # Parent-child linking
│   ├── enrollments.ts          # Enrollment request mutations
│   ├── classes.ts              # Class/curriculum definitions
│   ├── schedules.ts            # Schedule CRUD + assignment
│   ├── assignments.ts          # Homework/assignment mutations
│   ├── submissions.ts          # Student submission mutations
│   ├── notes.ts                # Student notes CRUD
│   ├── notifications.ts        # Notification creation + queries
│   ├── newsFeed.ts             # Church news CRUD
│   ├── meetings.ts             # Parent meetings
│   ├── reports.ts              # Admin reporting queries
│   └── crons.ts                # Scheduled notification jobs
├── src/
│   ├── main.tsx
│   ├── routeTree.gen.ts
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx                        # Homepage
│   │   ├── enroll/
│   │   │   ├── student.tsx
│   │   │   └── teacher.tsx
│   │   ├── dashboard/
│   │   │   ├── student/
│   │   │   │   ├── index.tsx                # Student home
│   │   │   │   ├── assignments.tsx
│   │   │   │   ├── assignment.$id.tsx       # View + submit
│   │   │   │   ├── notes.tsx
│   │   │   │   └── grades.tsx
│   │   │   ├── teacher/
│   │   │   │   ├── index.tsx                # Teacher home
│   │   │   │   ├── schedules.tsx
│   │   │   │   ├── create-assignment.tsx
│   │   │   │   ├── submissions.tsx
│   │   │   │   └── submission.$id.tsx
│   │   │   ├── parent/
│   │   │   │   ├── index.tsx                # Parent home
│   │   │   │   ├── children.tsx
│   │   │   │   ├── child.$id.tsx
│   │   │   │   └── meetings.tsx
│   │   │   └── admin/
│   │   │       ├── index.tsx                # Admin home
│   │   │       ├── enrollments.tsx
│   │   │       ├── users.tsx
│   │   │       ├── schedules.tsx
│   │   │       ├── curriculum.tsx
│   │   │       ├── news.tsx
│   │   │       ├── meetings.tsx
│   │   │       └── reports.tsx
│   │   └── auth/
│   │       ├── sign-in.tsx
│   │       └── sign-up.tsx
│   ├── components/
│   │   ├── ui/                  # Shadcn components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   └── NotificationBell.tsx
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   ├── NewsFeed.tsx
│   │   │   ├── QuickEnroll.tsx
│   │   │   └── Features.tsx
│   │   ├── student/
│   │   │   ├── AssignmentCard.tsx
│   │   │   ├── SubmissionEditor.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   └── ProgressChart.tsx
│   │   ├── teacher/
│   │   │   ├── ScheduleCalendar.tsx
│   │   │   ├── AssignmentBuilder.tsx
│   │   │   ├── SubmissionReview.tsx
│   │   │   └── ScheduleResponse.tsx
│   │   ├── parent/
│   │   │   ├── ChildProgress.tsx
│   │   │   ├── MeetingCard.tsx
│   │   │   └── AssignmentAlert.tsx
│   │   ├── admin/
│   │   │   ├── EnrollmentQueue.tsx
│   │   │   ├── UserManager.tsx
│   │   │   ├── ScheduleBuilder.tsx
│   │   │   ├── CurriculumManager.tsx
│   │   │   └── ReportsDashboard.tsx
│   │   └── shared/
│   │       ├── NotificationPanel.tsx
│   │       ├── RichTextEditor.tsx
│   │       ├── FileUpload.tsx
│   │       ├── StatusBadge.tsx
│   │       └── ConfirmDialog.tsx
│   ├── hooks/
│   │   ├── useNotifications.ts
│   │   ├── useRole.ts
│   │   └── useRealtime.ts
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client setup
│   │   ├── api.ts               # REST API client (talks to Express server)
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 3. Database Schema (PostgreSQL via Supabase)

> The existing Convex schema maps directly to PostgreSQL tables. Each `defineTable()` becomes a `CREATE TABLE` statement.
> The `convex/_generated/` directory is replaced by our Express.js API routes in `server/src/routes/`.

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // ── Users (synced from Clerk) ──
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("parent"),
      v.literal("admin"),
      v.literal("assistant")
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_email", ["email"]),

  // ── Enrollment Requests ──
  enrollmentRequests: defineTable({
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(v.literal("student"), v.literal("teacher")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    // Student-specific
    dateOfBirth: v.optional(v.string()),
    grade: v.optional(v.string()),
    parentEmail: v.optional(v.string()),
    parentPhone: v.optional(v.string()),
    // Teacher-specific
    qualifications: v.optional(v.string()),
    preferredSubjects: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_role_status", ["role", "status"]),

  // ── Parent-Child Links ──
  parentStudentLinks: defineTable({
    parentId: v.id("users"),
    studentId: v.id("users"),
    relationship: v.string(), // "mother", "father", "guardian"
  })
    .index("by_parent", ["parentId"])
    .index("by_student", ["studentId"]),

  // ── Curricula ──
  curricula: defineTable({
    name: v.string(),           // "Bible Studies Grade 3"
    description: v.string(),
    gradeLevel: v.string(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_grade", ["gradeLevel"]),

  // ── Classes (a curriculum instance for a specific term) ──
  classes: defineTable({
    curriculumId: v.id("curricula"),
    name: v.string(),           // "Bible Studies - Sunday AM"
    term: v.string(),           // "Fall 2026"
    teacherId: v.id("users"),
    studentIds: v.array(v.id("users")),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_term", ["term"]),

  // ── Schedules ──
  schedules: defineTable({
    classId: v.id("classes"),
    teacherId: v.id("users"),
    date: v.string(),           // "2026-04-05" (ISO date for specific Sunday)
    startTime: v.string(),      // "09:00"
    endTime: v.string(),        // "10:30"
    recurrence: v.optional(v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly"),
      v.literal("once")
    )),
    status: v.union(
      v.literal("assigned"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
    responseDeadline: v.string(), // ISO date — 2-3 days after assignment
    remindersSent: v.number(),    // tracks how many reminders sent (max 3)
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_class", ["classId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"]),

  // ── Assignments / Homework ──
  assignments: defineTable({
    classId: v.id("classes"),
    teacherId: v.id("users"),
    title: v.string(),
    description: v.string(),      // Rich text / markdown
    instructions: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())), // storage IDs
    dueDate: v.string(),
    maxScore: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("closed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_class", ["classId"])
    .index("by_teacher", ["teacherId"])
    .index("by_dueDate", ["dueDate"]),

  // ── Student Submissions ──
  submissions: defineTable({
    assignmentId: v.id("assignments"),
    studentId: v.id("users"),
    content: v.string(),           // Rich text answer
    attachments: v.optional(v.array(v.string())),
    submittedAt: v.optional(v.number()),
    status: v.union(
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("graded"),
      v.literal("returned")
    ),
    score: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedBy: v.optional(v.id("users")),
    gradedAt: v.optional(v.number()),
  })
    .index("by_assignment", ["assignmentId"])
    .index("by_student", ["studentId"])
    .index("by_assignment_student", ["assignmentId", "studentId"]),

  // ── Student Notes ──
  notes: defineTable({
    studentId: v.id("users"),
    title: v.string(),
    content: v.string(),
    classId: v.optional(v.id("classes")),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"]),

  // ── Notifications ──
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("enrollment_approved"),
      v.literal("enrollment_rejected"),
      v.literal("enrollment_pending"),    // to admin
      v.literal("schedule_assigned"),
      v.literal("schedule_reminder"),
      v.literal("schedule_accepted"),
      v.literal("schedule_rejected"),
      v.literal("assignment_published"),
      v.literal("submission_received"),   // to teacher
      v.literal("submission_graded"),     // to student
      v.literal("meeting_scheduled"),
      v.literal("meeting_reminder"),
      v.literal("news_posted"),
      v.literal("general")
    ),
    title: v.string(),
    message: v.string(),
    linkTo: v.optional(v.string()),       // route to navigate to
    isRead: v.boolean(),
    relatedId: v.optional(v.string()),    // ID of related entity
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),

  // ── Church News Feed ──
  newsFeed: defineTable({
    title: v.string(),
    content: v.string(),          // Rich text
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()), // storage ID
    authorId: v.id("users"),
    isPinned: v.boolean(),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_published", ["isPublished", "publishedAt"]),

  // ── Blog Posts (CMS) ──
  blogPosts: defineTable({
    title: v.string(),
    content: v.string(),          // Rich text / markdown
    excerpt: v.string(),
    category: v.string(),         // "Teaching", "Community", "Spirituality", etc.
    coverImage: v.optional(v.string()),
    authorId: v.id("users"),
    readTimeMinutes: v.optional(v.number()),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_published", ["isPublished", "publishedAt"])
    .index("by_category", ["category"]),

  // ── Church Events (CMS) ──
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),             // ISO date
    startTime: v.string(),
    endTime: v.optional(v.string()),
    location: v.string(),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()), // "Liturgy", "Fellowship", "School", etc.
    organizedBy: v.id("users"),
    isPublished: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_published", ["isPublished"]),

  // ── Fasting Seasons (CMS) ──
  fastingSeasons: defineTable({
    name: v.string(),             // "Hudade (Great Lent)"
    nameGeez: v.optional(v.string()), // ጾመ ዓርባ
    startDate: v.string(),
    endDate: v.string(),
    totalDays: v.number(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    year: v.number(),
    createdAt: v.number(),
  })
    .index("by_year", ["year"])
    .index("by_active", ["isActive"]),

  // ── Verses of the Day (CMS) ──
  versesOfDay: defineTable({
    text: v.string(),
    reference: v.string(),        // "Joshua 1:9"
    date: v.optional(v.string()), // specific date or null for rotation
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive"]),

  // ── Parent Meetings ──
  meetings: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    location: v.optional(v.string()),
    organizedBy: v.id("users"),
    invitedParentIds: v.optional(v.array(v.id("users"))), // null = all parents
    remindersSent: v.number(),
    createdAt: v.number(),
  })
    .index("by_date", ["date"]),

  // ── Attendance (bonus feature) ──
  attendance: defineTable({
    scheduleId: v.id("schedules"),
    studentId: v.id("users"),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("excused")
    ),
    markedBy: v.id("users"),
    markedAt: v.number(),
  })
    .index("by_schedule", ["scheduleId"])
    .index("by_student", ["studentId"]),
});
```

---

## 4. Feature Breakdown — Phase by Phase

### Phase 1: Foundation (Week 1-2)
**Claude Code Prompt:**
> Set up the project: React 19 + Vite + React Router v7 + TanStack Query + Tailwind CSS + Supabase Auth + Supabase JS client. Configure Docker Compose for local dev with Supabase stack (PostgreSQL, GoTrue auth, PostgREST, Realtime, Storage). Create the PostgreSQL tables from the schema. Build the Express.js API server with Supabase auth middleware. Implement user CRUD, role management, and enrollment workflows. Build the root layout with responsive navigation that adapts based on user role. Implement role-based route guards.

Deliverables:
- [ ] Project scaffolded with all dependencies
- [ ] Supabase PostgreSQL schema created and migrated
- [ ] Supabase Auth ↔ Express API user sync working
- [ ] Root layout with role-aware navigation
- [ ] Route guards (admin, teacher, student, parent)
- [ ] Docker Compose environment running (Supabase + Frontend)

### Phase 2: Homepage + Enrollment (Week 2-3)
**Claude Code Prompt:**
> Build the public homepage for Eritrean Saint Mary Orthodox Tewahdo Church. This is a content-first church website, NOT a school enrollment landing page. Design: Eritrean Orthodox aesthetic with earth tones, Byzantine gold (#B8860B), deep navy, parchment backgrounds, Ge'ez-inspired decorative patterns, and Mesob (traditional basket) geometric motifs. Typography: Cormorant Garamond for headings, DM Sans for body. Include Ge'ez script (ቅድስት ማርያም) in the logo. Structure: (1) Full-screen event image carousel with auto-advance and manual dots, (2) Verse of the Day section with auto-rotating Bible verses and decorative Ge'ez borders, (3) Upcoming Events grid pulling from Supabase events table, (4) Blog & Reflections section from Supabase blogPosts table, (5) Fasting Calendar showing major fasting seasons with active/upcoming status, (6) Community CTA section, (7) Footer with Ge'ez service names. Navigation: "Join Us" dropdown menu containing "Enroll as Student", "Volunteer as Teacher", "Register as Parent" — enrollment is NOT on the main page. Add a floating AI chat assistant button (bottom-right) that opens a chat panel for Orthodox faith Q&A and app help — powered by Claude API via Express route. Build enrollment forms as separate routes. Build a Supabase-powered CMS so admins can manage blog posts, events, fasting schedules, and news from the admin dashboard.

Deliverables:
- [ ] Content-first responsive homepage with carousel
- [ ] Verse of the Day with auto-rotation
- [ ] Events, Blog, Fasting sections (Supabase-powered)
- [ ] AI chat assistant (floating panel)
- [ ] "Join Us" dropdown navigation (not front-page CTAs)
- [ ] Student enrollment form (separate route)
- [ ] Teacher enrollment form (separate route)
- [ ] Parent registration form (separate route)
- [ ] Admin notification on new enrollment
- [ ] CMS tables in Supabase (events, blogPosts, fastingSeasons)

### Phase 3: Admin Dashboard (Week 3-4)
**Claude Code Prompt:**
> Build the admin dashboard: enrollment queue with approve/reject actions (rejection requires a brief reason), user management table with search/filter/role-change/deactivate, curriculum CRUD, class creation (assign curriculum + teacher + students), schedule builder (calendar UI — click a Sunday to create a schedule, assign a teacher, set time, auto-calculate response deadline 2-3 days out), news feed editor with rich text and cover images, parent meeting scheduler. Every action that affects a user triggers a notification. Include an "assistant" role with the same powers as admin.

Deliverables:
- [ ] Enrollment approval/rejection queue
- [ ] User management (CRUD + role assignment)
- [ ] Curriculum & class management
- [ ] Visual schedule builder (calendar-based)
- [ ] News feed CMS
- [ ] Meeting scheduler
- [ ] Reports dashboard (teacher activity, student progress, attendance)

### Phase 4: Teacher Dashboard (Week 4-5)
**Claude Code Prompt:**
> Build the teacher dashboard: upcoming schedule calendar view showing assigned Sundays with color-coded status (assigned/accepted/rejected), schedule response flow (accept by default, reject with brief reason — only available 2-3 days after assignment), assignment/homework builder with rich text editor + file attachments + due date + assign to class, submission inbox showing student submissions with grading interface (score + written feedback), class roster view. Implement 3-tier reminder system for approaching Sundays: 7 days before, 3 days before, and day-of — via Convex cron jobs that create notifications + send email/SMS.

Deliverables:
- [ ] Schedule calendar with accept/reject
- [ ] 3-tier reminder system (cron jobs)
- [ ] Assignment builder with rich text
- [ ] Submission review + grading interface
- [ ] Class roster view

### Phase 5: Student Dashboard (Week 5-6)
**Claude Code Prompt:**
> Build the student dashboard: assignments feed showing pending/completed homework with due dates and status badges, assignment detail view with instructions + embedded workspace to write answers using a rich text editor + file upload, submit button that sends to the assigning teacher and triggers notification, personal notes system (create/edit/delete/pin notes, optionally link to a class), grades overview showing scores and teacher feedback per assignment, progress charts.

Deliverables:
- [ ] Assignment feed with filters
- [ ] In-dashboard homework workspace
- [ ] Submission flow with teacher notification
- [ ] Notes system (CRUD + pin + class-link)
- [ ] Grades & progress view

### Phase 6: Parent Dashboard (Week 6-7)
**Claude Code Prompt:**
> Build the parent dashboard: children overview cards showing each linked child's name, grade, class, and recent activity, child detail view with assignment status + grades + attendance, real-time notification when a child receives a new assignment, meeting section showing upcoming parent meetings with details + countdown, meeting reminder system (7 days, 3 days, 1 day before). Parents should be linked to students during enrollment or by admin.

Deliverables:
- [ ] Children overview with progress cards
- [ ] Per-child detailed view
- [ ] Assignment notification to parents
- [ ] Meeting view with reminders
- [ ] Parent-student linking flow

### Phase 7: Notification System + Polish (Week 7-8)
**Claude Code Prompt:**
> Implement the unified notification system: in-app notification bell with unread count + dropdown panel, real-time updates via Convex subscriptions, email notifications via Resend for critical events (enrollment decisions, schedule assignments, meeting reminders), SMS via Twilio for reminders. Add Web Push API for browser notifications. Add notification preferences per user. Polish all dashboards: loading skeletons, empty states, error boundaries, responsive design, animations with Framer Motion, dark mode toggle. Add attendance tracking for teachers to mark student presence.

Deliverables:
- [ ] Notification bell + panel (real-time)
- [ ] Email integration (Resend)
- [ ] SMS integration (Twilio)
- [ ] Web Push notifications
- [ ] Notification preferences
- [ ] Attendance tracking
- [ ] UI polish pass on all screens
- [ ] Dark mode

### Phase 8: Docker + Deployment (Week 8)
**Claude Code Prompt:**
> Containerize the application: multi-stage Dockerfile for the React frontend (build + Nginx serve), Express API server container, docker-compose with all Supabase services (PostgreSQL, GoTrue auth, PostgREST, Realtime, Storage). Add health checks, production Nginx config with gzip + caching headers, and a .env.example with all required variables documented. Write a comprehensive README with setup instructions.

Deliverables:
- [ ] Production Dockerfile
- [ ] docker-compose.yml
- [ ] Nginx config
- [ ] README with full setup guide
- [ ] .env.example

---

## 5. Additional Features (Added)

These are features you didn't explicitly mention but are essential for a school app:

1. **Attendance Tracking** — Teachers mark students present/absent/excused each Sunday; parents and admin can see attendance history
2. **Grading & Feedback** — Score assignments + written feedback visible to students and parents
3. **Rich Text Editor** — For assignments, submissions, notes, and news (use TipTap or Lexical)
4. **File Attachments** — Upload PDFs, images, docs to assignments and submissions via Convex file storage
5. **Dark Mode** — Toggle for all dashboards
6. **Notification Preferences** — Users choose which notifications they receive via email/SMS/push
7. **Audit Log** — Admin can see who did what and when (enrollment decisions, grade changes, etc.)
8. **Search** — Global search across students, teachers, assignments, classes
9. **Export** — Admin can export reports as CSV/PDF
10. **Mobile Responsive** — Every screen works on phone/tablet (most parents will use phones)

---

## 6. Notification Matrix

| Event | Who Gets Notified | In-App | Email | SMS |
|-------|-------------------|--------|-------|-----|
| New enrollment request | Admin + Assistants | ✅ | ✅ | ❌ |
| Enrollment approved | Applicant | ✅ | ✅ | ✅ |
| Enrollment rejected | Applicant | ✅ | ✅ | ❌ |
| Schedule assigned to teacher | Teacher | ✅ | ✅ | ✅ |
| Schedule reminder (7d, 3d, 1d) | Teacher | ✅ | ✅ | ✅ |
| Teacher accepts/rejects schedule | Admin | ✅ | ✅ | ❌ |
| Assignment published | Students in class + Parents | ✅ | ✅ | ❌ |
| Student submits homework | Assigning teacher | ✅ | ✅ | ❌ |
| Submission graded | Student + Parent | ✅ | ✅ | ❌ |
| Parent meeting scheduled | Invited parents | ✅ | ✅ | ✅ |
| Meeting reminder (7d, 3d, 1d) | Invited parents | ✅ | ✅ | ✅ |
| News posted | All users | ✅ | ❌ | ❌ |
| User role changed | Affected user | ✅ | ✅ | ❌ |

---

## 7. Design System

**Color Palette:**
- Primary: `#1E3A5F` (Deep Navy) — authority, trust
- Secondary: `#C9A84C` (Byzantine Gold) — tradition, warmth
- Accent: `#8B2332` (Liturgical Red) — highlights, alerts
- Background: `#FAFAF5` (Warm Cream) — soft, inviting
- Surface: `#FFFFFF`
- Text: `#1A1A2E` (Near Black)
- Muted: `#6B7280`

**Typography:**
- Headings: "Playfair Display" (serif — elegant, ecclesiastical feel)
- Body: "Source Sans 3" (clean, readable)
- Monospace: "JetBrains Mono" (code/data)

**Component Patterns:**
- Cards with subtle shadows and gold accent borders
- Rounded corners (8-12px)
- Warm gradients for hero sections
- Icon set: Lucide React
- Status badges: color-coded pills
- Loading: skeleton shimmer animations

---

## 8. Key API Patterns (Convex Functions)

```typescript
// Example: Schedule assignment with auto-notification
// convex/schedules.ts

export const assignSchedule = mutation({
  args: {
    classId: v.id("classes"),
    teacherId: v.id("users"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    recurrence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthUser(ctx);
    requireRole(admin, ["admin", "assistant"]);

    const deadline = addDays(new Date(args.date), -3).toISOString();

    const scheduleId = await ctx.db.insert("schedules", {
      ...args,
      status: "assigned",
      responseDeadline: deadline,
      remindersSent: 0,
      createdBy: admin._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Auto-notify teacher
    await ctx.db.insert("notifications", {
      userId: args.teacherId,
      type: "schedule_assigned",
      title: "New Schedule Assignment",
      message: `You've been assigned to teach on ${args.date}`,
      linkTo: `/dashboard/teacher/schedules`,
      isRead: false,
      relatedId: scheduleId,
      createdAt: Date.now(),
    });

    // Schedule 3 reminders via Convex cron
    await ctx.scheduler.runAt(
      subDays(new Date(args.date), 7).getTime(),
      internal.notifications.sendScheduleReminder,
      { scheduleId, reminderNumber: 1 }
    );
    // ... repeat for 3 days and 1 day before

    return scheduleId;
  },
});
```

---

## 9. Claude Code Session Prompts

Use these prompts sequentially. Each builds on the previous.

### Session 1 — Project Setup
```
Create a new React 19 + Vite project called "saint-mary-school". Install and configure:
- TanStack Router (file-based routing)
- TanStack Query
- TanStack Form + Zod
- Tailwind CSS 4
- Shadcn/ui (all components)
- Clerk React SDK
- Convex React SDK

Set up the Convex schema exactly as defined in the CLAUDE_CODE_PLAN.md schema section.
Create a docker-compose.yml with a frontend service.
Create the root route with a ClerkProvider and ConvexProviderWithClerk wrapper.
Set up a responsive AppShell layout component with a collapsible sidebar.
```

### Session 2 — Auth + Roles
```
Implement Clerk ↔ Convex user sync via webhook. When a user signs up via Clerk,
create a corresponding user document in Convex with role "student" (default).
Build role-based route guards: createProtectedRoute() that checks the user's role
and redirects to /unauthorized if they don't have access. Create role-aware
sidebar navigation that shows different links for student/teacher/parent/admin.
```

### Session 3 — Homepage
```
Build the public homepage at src/routes/index.tsx. Follow the design system from
CLAUDE_CODE_PLAN.md. Include: a hero section with a warm gradient background and
church school tagline, enrollment CTA buttons, a live news feed section pulling
from the Convex newsFeed table, a features grid showing what the platform offers,
and a footer with church contact info. Make it stunning and responsive.
```

### Session 4 — Enrollment
```
Build enrollment forms at src/routes/enroll/student.tsx and teacher.tsx.
Student form: name, DOB, grade, parent contact, email or phone (choose one).
Teacher form: name, qualifications, preferred subjects, email or phone.
Use TanStack Form + Zod validation. On submit, call Convex mutations to create
enrollmentRequests with status "pending" and notify all admin users.
Show a success page after submission.
```

### Session 5 — Admin Dashboard
```
Build the admin dashboard. Start with the enrollment queue at
src/routes/dashboard/admin/enrollments.tsx — show pending requests in a table
with approve/reject buttons. Rejection opens a modal for a brief reason.
Build user management at users.tsx — searchable table of all users with role
badges, and ability to change roles, activate/deactivate. Build the schedule
builder at schedules.tsx — a calendar UI where admin clicks a Sunday, selects
a class and teacher, sets time, and assigns. Auto-notify the teacher.
```

### Session 6 — Teacher Dashboard
```
Build the teacher dashboard. Schedule view: calendar showing assigned Sundays
with color-coded status chips. Click a schedule to see details and accept/reject
(reject requires brief reason, only available within response deadline).
Assignment builder: create homework with rich text (use TipTap), file upload,
due date, assign to a class. Submission inbox: list of student submissions
with status, click to review and grade (score + feedback).
```

### Session 7 — Student Dashboard
```
Build the student dashboard. Assignment feed: cards showing title, class, due date,
status (pending/submitted/graded). Click to open assignment detail with instructions
and an embedded workspace — rich text editor + file upload to write answers and submit.
Notes system: CRUD for personal notes with title, content, optional class link,
pin toggle. Grades view: table of all graded submissions with score and feedback.
```

### Session 8 — Parent Dashboard
```
Build the parent dashboard. Children overview: cards for each linked child showing
name, grade, recent assignments. Click child card to see detailed view with
assignment list, grades, attendance. Meetings section: upcoming parent meetings
with date, time, location, countdown timer. Set up parent-student linking
(admin can link parents to students in user management).
```

### Session 9 — Notifications
```
Implement the full notification system. NotificationBell component in the top nav
with unread count badge and dropdown panel. Real-time via Convex useQuery subscription.
Mark as read on click. "Mark all read" button. Notification preferences page where
users toggle email/SMS/push per notification type. Set up Convex cron jobs for
schedule reminders (7d, 3d, 1d before) and meeting reminders. Integrate Resend
for email and Twilio for SMS (use environment variables for keys).
```

### Session 10 — Polish + Deploy
```
Polish pass: add loading skeletons for all data-fetching states, empty state
illustrations, error boundaries with retry, smooth page transitions with
Framer Motion, responsive tweaks for mobile. Add dark mode toggle using Tailwind
dark: classes and a theme context. Add attendance tracking to teacher dashboard.
Finalize Docker setup with production multi-stage build, Nginx config with gzip
and caching, and comprehensive README.
```

---

## 10. Environment Variables

```env
# .env.example

## 9. Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API
VITE_API_URL=http://localhost:3001

# Email (SMTP)
SMTP_HOST=localhost
SMTP_PORT=1025
FROM_EMAIL=school@saintmarychurch.org

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+1...

# Web Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# AI Chat
ANTHROPIC_API_KEY=
```

# Resend (email)
RESEND_API_KEY=re_...
FROM_EMAIL=school@saintmarychurch.org

# Twilio (SMS)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Web Push
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

---

## 11. Testing Strategy

- **Unit Tests:** Vitest for utility functions, Convex function logic
- **Component Tests:** React Testing Library for form validation, conditional rendering
- **E2E Tests:** Playwright for critical flows (enrollment → approval → login → dashboard)
- **Key test scenarios:**
  - Student enrolls → admin approves → student logs in → sees dashboard
  - Admin creates schedule → teacher receives notification → teacher accepts
  - Teacher creates assignment → student sees it → submits → teacher grades → student + parent see grade
  - Parent receives meeting notification → sees meeting details

---

*This plan is designed to be executed with Claude Code session by session. Each session builds on the previous one. Copy each session prompt into Claude Code and let it implement. Review and test after each session before moving to the next.*
