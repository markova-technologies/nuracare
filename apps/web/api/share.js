import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  // GET: Fetch shared session by token (public endpoint)
  if (req.method === 'GET') {
    const token = req.query?.token;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.rpc('get_shared_session', { p_share_token: token });
    const session = Array.isArray(data) ? data[0] : data;

    if (error || !session) {
      return res.status(404).json({ error: 'Shared session not found or revoked' });
    }

    return res.status(200).json(session);
  }

  // POST & DELETE: Authenticated user actions
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const userToken = authHeader.replace('Bearer ', '');

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${userToken}` } }
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const { data: session, error: dbError } = await supabase
      .from('sessions')
      .select('id, share_token')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        const { data: allSessions } = await supabase.from('sessions').select('id').eq('user_id', user.id);
        const availableIds = allSessions ? allSessions.map(s => s.id) : [];
        return res.status(404).json({ error: `Session not found. Requested: ${sessionId}. Available: ${availableIds.join(', ')}` });
      }
      return res.status(500).json({ error: `Database error: ${dbError.message}` });
    }
    if (!session) return res.status(404).json({ error: 'Session not found' });

    let shareToken = session.share_token;
    if (!shareToken) {
      shareToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      const { error: updateError } = await supabase.from('sessions')
        .update({ share_token: shareToken, shared_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id);
      if (updateError) return res.status(500).json({ error: 'Failed to update share token' });
    }

    return res.status(200).json({ shareToken });
  }

  if (req.method === 'DELETE') {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const { error: updateError } = await supabase.from('sessions')
      .update({ share_token: null, shared_at: null })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) return res.status(500).json({ error: 'Failed to revoke share token' });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
