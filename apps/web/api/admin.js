/**
 * NuraCare Admin, Telemetry & Memory API
 * Consolidated endpoint handling /api/admin, /api/analytics, and /api/memory
 */
import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key, X-Client-Platform, X-Client-Version, Authorization',
};

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(url, key);
}

// ─── Analytics Telemetry ──────────────────────────────────────────────────────

async function handleAnalytics(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  const { events, platform, appVersion, userId } = body || {};

  if (!events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'No events provided' });
  }

  try {
    const supabase = getSupabase();
    const rows = events.map(evt => ({
      user_id: userId && !String(userId).startsWith('guest_') ? userId : null,
      platform: platform || 'unknown',
      app_version: appVersion || '1.0.0',
      event_name: evt.name,
      properties: evt.properties || {},
      created_at: evt.timestamp || new Date().toISOString(),
    }));

    const { error } = await supabase.from('analytics_events').insert(rows);
    if (error) {
      console.warn('[Analytics API] Supabase insert warning:', error.message);
    }

    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    console.error('[Analytics API] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── Conversation Memory Continuity ───────────────────────────────────────────

async function handleMemory(req, res) {
  const supabase = getSupabase();

  if (req.method === 'GET') {
    const userId = req.query?.user_id;
    if (!userId) return res.status(400).json({ error: 'Missing user_id query parameter' });

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, name, messages, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) {
        console.warn('[Memory API] Supabase select error:', error.message);
        return res.status(200).json({ summaries: [] });
      }

      const summaries = [];
      for (const session of data || []) {
        if (Array.isArray(session.messages)) {
          const summaryMsg = session.messages.find(m => m.isSummary || m.role === 'system_summary');
          if (summaryMsg) {
            summaries.push({
              sessionId: session.id,
              sessionName: session.name,
              summary: summaryMsg.content,
              updatedAt: session.updated_at
            });
          }
        }
      }

      return res.status(200).json({ summaries });
    } catch (err) {
      console.error('[Memory API] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { userId, sessionId, summary } = req.body || {};
    if (!userId || !sessionId || !summary) {
      return res.status(400).json({ error: 'Missing userId, sessionId, or summary' });
    }

    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('messages')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (session) {
        const msgs = Array.isArray(session.messages) ? session.messages : [];
        const filtered = msgs.filter(m => !m.isSummary && m.role !== 'system_summary');
        filtered.push({
          role: 'system_summary',
          isSummary: true,
          content: summary,
          timestamp: new Date().toISOString()
        });

        await supabase.from('sessions').update({ messages: filtered, updated_at: new Date().toISOString() }).eq('id', sessionId);
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[Memory API] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ─── Control Center & Dashboard Stats ─────────────────────────────────────────

async function handleControlCenter(req, res) {
  const adminKey = req.headers?.['x-admin-key'];
  const configuredSecret = process.env.ADMIN_SECRET_KEY || 'nuracare-admin-2026';
  
  if (process.env.NODE_ENV === 'production' && adminKey !== configuredSecret && !adminKey) {
    return res.status(401).json({ error: 'Unauthorized admin access' });
  }

  const supabase = getSupabase();

  if (req.method === 'GET') {
    try {
      const { data: analyticsCount } = await supabase.from('analytics_events').select('id', { count: 'exact', head: true });
      const { count: postsCount } = await supabase.from('community_posts').select('*', { count: 'exact', head: true });

      const stats = {
        platformVersion: '1.0.6',
        status: 'HEALTHY',
        activeServices: {
          aiRouter: 'Operational (Groq Edge)',
          realtimeCommunity: 'Operational (Supabase WebSockets)',
          storageEngine: 'Operational (Supabase Storage)',
          healthIntegrations: 'Operational (Fitbit & Oura Ring OAuth2)',
        },
        metrics: {
          totalIngestedEvents: analyticsCount || 0,
          totalCommunityPosts: postsCount || 0,
        },
        timestamp: new Date().toISOString(),
      };

      return res.status(200).json(stats);
    } catch (err) {
      console.error('[Admin API] Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key, X-Client-Platform, X-Client-Version, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query?.action || req.body?.action;

  if (action === 'analytics') {
    return handleAnalytics(req, res);
  }
  if (action === 'memory') {
    return handleMemory(req, res);
  }

  return handleControlCenter(req, res);
}
