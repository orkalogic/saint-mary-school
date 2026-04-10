-- 001_initial_schema.sql
-- Complete database schema for Saint Mary Church School
-- Maps the Convex schema to PostgreSQL tables

-- ── Users ──
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin', 'assistant')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_users_by_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_by_role ON users(role);
CREATE INDEX idx_users_by_email ON users(email);

-- ── Enrollment Requests ──
CREATE TABLE IF NOT EXISTS enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  -- Student-specific
  date_of_birth TEXT,
  grade TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  -- Teacher-specific
  qualifications TEXT,
  preferred_subjects JSONB,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_enrollments_by_status ON enrollment_requests(status);
CREATE INDEX idx_enrollments_by_role_status ON enrollment_requests(role, status);

-- ── Parent-Student Links ──
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL
);

CREATE INDEX idx_parent_links_by_parent ON parent_student_links(parent_id);
CREATE INDEX idx_parent_links_by_student ON parent_student_links(student_id);

-- ── Curricula ──
CREATE TABLE IF NOT EXISTS curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_curricula_by_grade ON curricula(grade_level);

-- ── Classes ──
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES curricula(id),
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES users(id),
  student_ids UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_classes_by_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_by_term ON classes(term);

-- ── Schedules ──
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  recurrence TEXT CHECK (recurrence IN ('weekly', 'biweekly', 'monthly', 'once')),
  status TEXT NOT NULL CHECK (status IN ('assigned', 'accepted', 'rejected')),
  rejection_reason TEXT,
  response_deadline TEXT NOT NULL,
  reminders_sent INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_schedules_by_teacher ON schedules(teacher_id);
CREATE INDEX idx_schedules_by_class ON schedules(class_id);
CREATE INDEX idx_schedules_by_date ON schedules(date);
CREATE INDEX idx_schedules_by_status ON schedules(status);

-- ── Assignments ──
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  attachments JSONB,
  due_date TEXT NOT NULL,
  max_score INTEGER,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'closed')),
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_assignments_by_class ON assignments(class_id);
CREATE INDEX idx_assignments_by_teacher ON assignments(teacher_id);
CREATE INDEX idx_assignments_by_due_date ON assignments(due_date);

-- ── Submissions ──
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id),
  student_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  attachments JSONB,
  submitted_at BIGINT,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted', 'graded', 'returned')),
  score NUMERIC,
  feedback TEXT,
  graded_by UUID REFERENCES users(id),
  graded_at BIGINT
);

CREATE INDEX idx_submissions_by_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_by_student ON submissions(student_id);
CREATE INDEX idx_submissions_by_assignment_student ON submissions(assignment_id, student_id);

-- ── Notes ──
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  class_id UUID REFERENCES classes(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_notes_by_student ON notes(student_id);

-- ── Notifications ──
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN (
    'enrollment_approved', 'enrollment_rejected', 'enrollment_pending',
    'schedule_assigned', 'schedule_reminder', 'schedule_accepted', 'schedule_rejected',
    'assignment_published', 'submission_received', 'submission_graded',
    'meeting_scheduled', 'meeting_reminder',
    'news_posted', 'general'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_to TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id TEXT,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_notifications_by_user ON notifications(user_id);
CREATE INDEX idx_notifications_by_user_unread ON notifications(user_id, is_read);

-- ── Church News Feed ──
CREATE TABLE IF NOT EXISTS news_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID NOT NULL REFERENCES users(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at BIGINT,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_news_by_published ON news_feed(is_published, published_at);

-- ── Blog Posts ──
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID NOT NULL REFERENCES users(id),
  read_time_minutes INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at BIGINT,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_blog_by_published ON blog_posts(is_published, published_at);
CREATE INDEX idx_blog_by_category ON blog_posts(category);

-- ── Church Events ──
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT NOT NULL,
  cover_image TEXT,
  category TEXT,
  organized_by UUID NOT NULL REFERENCES users(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_events_by_date ON events(date);
CREATE INDEX idx_events_by_published ON events(is_published);

-- ── Fasting Seasons ──
CREATE TABLE IF NOT EXISTS fasting_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_geez TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_days INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  year INTEGER NOT NULL,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_fasting_by_year ON fasting_seasons(year);
CREATE INDEX idx_fasting_by_active ON fasting_seasons(is_active);

-- ── Verses of the Day ──
CREATE TABLE IF NOT EXISTS verses_of_day (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  reference TEXT NOT NULL,
  date TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_verses_by_active ON verses_of_day(is_active);

-- ── Parent Meetings ──
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  organized_by UUID NOT NULL REFERENCES users(id),
  invited_parent_ids UUID[],
  reminders_sent INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_meetings_by_date ON meetings(date);

-- ── Attendance ──
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id),
  student_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'excused')),
  marked_by UUID NOT NULL REFERENCES users(id),
  marked_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

CREATE INDEX idx_attendance_by_schedule ON attendance(schedule_id);
CREATE INDEX idx_attendance_by_student ON attendance(student_id);

-- ── Enable Realtime for all tables ──
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE enrollment_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE parent_student_links;
ALTER PUBLICATION supabase_realtime ADD TABLE curricula;
ALTER PUBLICATION supabase_realtime ADD TABLE classes;
ALTER PUBLICATION supabase_realtime ADD TABLE schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE news_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE fasting_seasons;
ALTER PUBLICATION supabase_realtime ADD TABLE verses_of_day;
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;

-- ── Row Level Security (RLS) ──
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses_of_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Note: Since our Express API server uses the service role key (bypasses RLS),
-- these policies are for direct client access via Supabase JS client.
-- The API server handles all authorization logic.

-- Users: authenticated users can read their own profile
-- Note: We use clerk_id (text) to match against auth.uid()::text for compatibility
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (clerk_id = auth.uid()::text);

-- Enrollment requests: users can read their own
CREATE POLICY "Users can read own enrollments" ON enrollment_requests
  FOR SELECT USING (clerk_id = auth.uid()::text);

-- Notifications: users can read their own
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.uid()
  ));

-- News, events, blog: anyone can read published content
CREATE POLICY "Anyone can read published news" ON news_feed
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can read published events" ON events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can read published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Fasting seasons and verses: anyone can read active ones
CREATE POLICY "Anyone can read active fasting seasons" ON fasting_seasons
  FOR SELECT USING (is_active = true OR year = EXTRACT(YEAR FROM NOW()));

CREATE POLICY "Anyone can read active verses" ON verses_of_day
  FOR SELECT USING (is_active = true);
