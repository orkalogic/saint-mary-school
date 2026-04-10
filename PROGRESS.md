# Saint Mary School - Progress Log

## Today's Work Summary

### What We Built
- **Full self-hosted migration** from Clerk + Convex Cloud → Supabase (PostgreSQL) + custom Express API
- **Complete CMS Dashboard** with sidebar navigation for Events, Blog, News, Fasting, Verses, About, Contact pages
- **Event Media System** with image/video upload, storage, and gallery viewing
- **Event Detail Pages** with hero image, description, and full media gallery
- **Lightbox Viewer** supporting both images and videos (auto-play, escape to close, arrow navigation)
- **Album Thumbnail Icons** on event cards showing photo/video count
- **Image Upload Pipeline** through API server (bypasses Supabase Storage RLS)
- **Homepage fully dynamic** - all content fetched from CMS (events, blog, fasting calendar, verses)
- **Events listing page** with upcoming/past filtering and media thumbnails
- **About & Contact pages** now dynamic from CMS

### Files Created/Modified (Key)
#### New Server Routes
- `server/src/routes/cms.ts` - CMS endpoints (events, blog, news, fasting, verses, pages, event media)
- `server/src/routes/classes.ts`, `assignments.ts`, `submissions.ts`, `notes.ts`, `schedules.ts`, `attendance.ts`, `notifications.ts`, `meetings.ts`, `links.ts`
- `server/src/index.ts` - Added `/api/upload` endpoint for file uploads via multer
- `server/src/lib/supabase.ts` - Supabase admin client (service role key)

#### New Frontend Pages
- `src/pages/Events.tsx` - Events listing with album icons
- `src/pages/EventDetail.tsx` - Event detail with media gallery + lightbox
- `src/pages/Blog.tsx` - Blog listing with category filters
- `src/pages/About.tsx` - Dynamic about page from CMS
- `src/pages/Contact.tsx` - Dynamic contact page from CMS
- `src/pages/dashboard/cms/CmsDashboard.tsx` - Full CMS dashboard
- `src/components/ImageUpload.tsx` - Drag & drop image upload component
- `src/components/MediaLibrary.tsx` - Media library browser/modal
- `src/components/NotificationBell.tsx` - Notification bell with dropdown
- `src/components/AIChat.tsx` - AI chat floating panel

#### Modified Frontend
- `src/App.tsx` - Added all new routes, NotificationBell + AIChat components
- `src/lib/api.ts` - Complete API client with 15+ endpoint groups
- `src/lib/supabase.ts` - Supabase client config
- `src/pages/HomePage.tsx` - All sections now dynamic from CMS API
- All enrollment and dashboard pages updated to use API instead of Convex

#### Database/Infrastructure
- `supabase/migrations/001_initial_schema.sql` - Full schema (18 tables)
- `supabase/migrations/002_setup_storage.sql` - CMS media storage bucket setup
- `docker-compose.yml` - Simplified to frontend-only (uses existing Supabase)
- `server/.env` - Server environment variables

---

### Critical Bugs Fixed & Lessons Learned

#### 1. Storage RLS Policy Issues
**Problem**: Browser-side Supabase Storage uploads were blocked by RLS policies (`new row violates row-level security policy`). The anon token didn't have the right auth context for storage operations.
**Fix**: Created `/api/upload` endpoint on the API server that uses `supabaseAdmin` (service role key) which bypasses all RLS. Frontend uploads file to API server via FormData, API server uploads to Supabase Storage with service role key, returns public URL.
**Lesson**: Always upload files through the API server, never directly from the browser to Supabase Storage.

#### 2. Storage Bucket Not Found
**Problem**: `StorageApiError: Bucket not found` even though `INSERT` into `storage.buckets` succeeded.
**Fix**: The Supabase storage service (Go process) needs a restart to pick up new buckets. `docker restart supabase-storage` resolved it.
**Lesson**: After creating storage buckets via SQL, restart the storage container.

#### 3. PostgREST Schema Cache
**Problem**: `Could not find the table 'public.event_media' in the schema cache` - PostgREST hadn't picked up the new table.
**Fix**: `docker restart supabase-rest` forces PostgREST to reload its schema cache.
**Lesson**: After adding new tables, always restart the PostgREST container.

#### 4. localhost URLs in Media
**Problem**: Videos and images uploaded by the API server got `http://localhost:8000/storage/...` URLs which don't work when accessing from a laptop at `192.168.40.5`.
**Fix**: 
  - Added `SUPABASE_PUBLIC_URL=http://192.168.40.5:8000` to `server/.env`
  - Upload endpoint rewrites `localhost` → public URL in the response
  - GET endpoints (`/cms/event-media/:eventId`) rewrite all stored URLs on-the-fly
**Lesson**: All media URLs stored in DB use localhost. The API server must rewrite them to the public IP on both upload and retrieval.

#### 5. FormData + Content-Type Header Conflict
**Problem**: The API client `request()` helper always set `Content-Type: application/json`, which broke FormData uploads (needs multipart/form-data with boundary).
**Fix**: Modified `request()` to detect `FormData` instances and skip setting `Content-Type`, letting the browser set it correctly.
**Lesson**: Never set `Content-Type` when sending FormData.

#### 6. isAdmin Undefined Reference
**Problem**: `ReferenceError: isAdmin is not defined` - the `isAdmin` declaration got accidentally removed when adding new state variables.
**Fix**: Re-added `const isAdmin = convexUser?.role === 'admin' || convexUser?.role === 'assistant'` after the new useEffect.
**Lesson**: Be careful when editing around variable declarations.

#### 7. Video Not Playing
**Problem**: Videos stored with `localhost` URLs were inaccessible from the laptop.
**Fix**: URL rewriting (see #4) + lightbox auto-play with `ref` to the video element.
**Lesson**: Always use public/reachable URLs in database records.

#### 8. Port Conflicts
**Problem**: Port 3001 was already occupied by another app (Orka Trader).
**Fix**: Changed API server to port 3005. Port 5432 already taken by another Supabase instance.
**Lesson**: Always check for port conflicts before starting services.

---

### Architecture Decisions
- **File uploads go through API server** (not browser → Supabase directly) to avoid RLS issues
- **URL rewriting on the API layer** (localhost → public IP) to support network access
- **PostgREST restart required** after adding new tables
- **Storage container restart required** after adding new buckets
- **API server uses service role key** for all database mutations (bypasses RLS, safe because it's server-side with auth middleware)

### Tomorrow's Plan
1. **Implement Better Auth** with OAuth 2.0 and OpenID Connect support
   - Replace Supabase auth with Better Auth
   - Configure OAuth providers (Google, email/password)
   - Migrate existing user data
2. **Complete remaining dashboards**
   - Student: assignments, notes, grades, schedule
   - Teacher: schedule, assignments, submissions, attendance
   - Parent: children overview, meetings, announcements
3. **Add rich text editor** for blog posts and event descriptions
4. **Implement notification system** (in-app + email)
5. **Complete attendance marking** for teachers
6. **Add parent-student linking** UI in admin

### Server Commands Reference
```bash
# Start API server
cd /home/hermes/projects/saint-mary-school/server && npx tsx src/index.ts

# Start frontend dev server
cd /home/hermes/projects/saint-mary-school && npx vite --host --port 5174

# Restart Supabase services (after schema/storage changes)
docker restart supabase-rest supabase-storage

# Check event_media records
docker exec supabase-db psql -U postgres -c "SELECT id, event_id, type, url FROM event_media ORDER BY created_at DESC LIMIT 10;"

# Check storage buckets
docker exec supabase-db psql -U postgres -c "SELECT id, name FROM storage.buckets;"
```
