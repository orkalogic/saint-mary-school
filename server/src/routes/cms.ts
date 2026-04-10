// server/src/routes/cms.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// ── Events ──
router.get('/events', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('events').select('*').eq('is_published', true).order('date', { ascending: true })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.post('/events', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('events').insert({ ...req.body, organized_by: req.userId, created_at: Date.now(), is_published: req.body.is_published ?? false }).select().single()
    if (error) throw error
    res.json(data)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.patch('/events/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('events').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.delete('/events/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('events').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

// ── Blog Posts ──
router.get('/blog', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.post('/blog', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('blog_posts').insert({ ...req.body, author_id: req.userId, created_at: Date.now(), is_published: req.body.is_published ?? false }).select().single()
    if (error) throw error
    res.json(data)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.patch('/blog/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('blog_posts').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.delete('/blog/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

// ── News Feed ──
router.get('/news', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('news_feed').select('*').eq('is_published', true).order('published_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.post('/news', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('news_feed').insert({ ...req.body, author_id: req.userId, created_at: Date.now(), is_published: req.body.is_published ?? false }).select().single()
    if (error) throw error
    res.json(data)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.patch('/news/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('news_feed').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.delete('/news/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('news_feed').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

// ── Fasting Seasons ──
router.get('/fasting', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('fasting_seasons').select('*').order('year', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.post('/fasting', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('fasting_seasons').insert({ ...req.body, created_at: Date.now() }).select().single()
    if (error) throw error
    res.json(data)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.delete('/fasting/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('fasting_seasons').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

// ── Verses of the Day ──
router.get('/verses', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('verses_of_day').select('*').eq('is_active', true).order('created_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.post('/verses', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('verses_of_day').insert({ ...req.body, created_at: Date.now() }).select().single()
    if (error) throw error
    res.json(data)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.delete('/verses/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('verses_of_day').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

// ── Page Content (About, Contact) ──
router.get('/pages', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('category', 'page')
      .order('created_at', { ascending: true })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.post('/pages', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({ ...req.body, author_id: req.userId, category: 'page', created_at: Date.now(), is_published: true })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.patch('/pages/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('blog_posts').update(req.body).eq('id', req.params.id).eq('category', 'page')
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.delete('/pages/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

// ── Event Media (images/videos per event) ──
// Upload via server to bypass storage RLS (uses service role key)
router.post('/event-media/upload', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { event_id, type, url, title, display_order } = req.body
    const { data, error } = await supabaseAdmin
      .from('event_media')
      .insert({ event_id, type, url, title: title || null, display_order: display_order || 0, created_at: Date.now() })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.get('/event-media/:eventId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_media')
      .select('*')
      .eq('event_id', req.params.eventId)
      .order('display_order', { ascending: true })
    if (error) throw error
    // Rewrite localhost URLs to public URL
    const pubUrl = process.env.SUPABASE_PUBLIC_URL || 'http://localhost:8000'
    const items = (data || []).map(m => ({
      ...m,
      url: m.url?.replace('http://localhost:8000', pubUrl),
    }))
    res.json(items)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.post('/event-media', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_media')
      .insert({ ...req.body, created_at: Date.now() })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

router.delete('/event-media/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('event_media').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

// Batch delete (for reordering)
router.post('/event-media/batch-delete', requireAuth, requireRole('admin', 'assistant'), async (req, res) => {
  try {
    const { ids } = req.body
    const { error } = await supabaseAdmin.from('event_media').delete().in('id', ids)
    if (error) throw error
    res.json(true)
  } catch (err: any) { res.status(500).json({ message: err.message }) }
})

export default router
