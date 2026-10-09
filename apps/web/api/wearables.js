import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return createClient(url, key);
}

// ─── Fitbit (Google Fitness) ──────────────────────────────────────────────────

function handleFitbitAuth(req, res) {
  const { userId } = req.query || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const clientId = process.env.FITBIT_CLIENT_ID;
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = encodeURIComponent(`${protocol}://${host}/api/fitbit-callback`);
  
  const scope = encodeURIComponent([
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' '));

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${userId}&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
}

async function handleFitbitCallback(req, res) {
  const { code, state, error } = req.query || {};
  if (error) return res.redirect(`/?error=fitbit_auth_denied`);
  if (!code || !state) return res.status(400).json({ error: 'Missing code or state parameter' });

  const userId = state;
  const clientId = process.env.FITBIT_CLIENT_ID;
  const clientSecret = process.env.FITBIT_CLIENT_SECRET;
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/fitbit-callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      }).toString()
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return res.redirect(`/?error=fitbit_token_exchange_failed&details=${encodeURIComponent(tokenData.error_description || tokenData.error || 'unknown_error')}`);
    }

    const supabase = getSupabase();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    await supabase.from('wearable_tokens').upsert({
      user_id: userId,
      provider: 'fitbit',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString()
    }, { onConflict: 'user_id, provider' });

    const { data: profile } = await supabase.from('profiles').select('connected_devices, syncing_devices').eq('id', userId).single();
    const existingDevices = profile?.connected_devices || {};
    const existingSyncing = profile?.syncing_devices || {};

    await supabase.from('profiles').update({
      connected_devices: { ...existingDevices, fitbit: true },
      syncing_devices: { ...existingSyncing, fitbit: true }
    }).eq('id', userId);

    res.redirect(`/?success=fitbit_connected`);
  } catch (err) {
    console.error('Fitbit Callback error:', err);
    res.redirect(`/?error=internal_server_error`);
  }
}

async function handleFitbitDisconnect(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const supabase = getSupabase();
  try {
    await supabase.from('wearable_tokens').delete().eq('user_id', userId).eq('provider', 'fitbit');
    const { data: profile } = await supabase.from('profiles').select('connected_devices').eq('id', userId).single();
    const existingDevices = profile?.connected_devices || {};
    await supabase.from('profiles').update({
      connected_devices: { ...existingDevices, fitbit: false }
    }).eq('id', userId);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fitbit Disconnect Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleFitbitSync(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const supabase = getSupabase();
  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from('wearable_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'fitbit')
      .single();

    if (tokenError || !tokenData) return res.status(400).json({ error: 'Fitbit not connected or token not found' });

    const accessToken = tokenData.access_token;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTimeMillis = startOfDay.getTime();
    const endTimeMillis = now.getTime();

    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    const aggregateBody = {
      aggregateBy: [
        { dataTypeName: 'com.google.step_count.delta' },
        { dataTypeName: 'com.google.heart_rate.bpm' }
      ],
      bucketByTime: { durationMillis: endTimeMillis - startTimeMillis },
      startTimeMillis,
      endTimeMillis
    };

    const aggregateRes = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers,
      body: JSON.stringify(aggregateBody)
    });
    const aggregateData = aggregateRes.ok ? await aggregateRes.json() : {};

    const sleepRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis - 86400000).toISOString()}&endTime=${now.toISOString()}&activityType=72`, { headers });
    const sleepData = sleepRes.ok ? await sleepRes.json() : {};

    let steps = 0;
    let restingHr = null;
    let sleepMin = 0;

    if (aggregateData.bucket && aggregateData.bucket.length > 0) {
      const bucket = aggregateData.bucket[0];
      const stepDataset = bucket.dataset.find(d => d.dataSourceId.includes('step_count.delta'));
      if (stepDataset && stepDataset.point.length > 0) {
        steps = stepDataset.point.reduce((acc, p) => acc + (p.value[0].intVal || 0), 0);
      }
      const hrDataset = bucket.dataset.find(d => d.dataSourceId.includes('heart_rate.bpm'));
      if (hrDataset && hrDataset.point.length > 0) {
        restingHr = Math.round(hrDataset.point[0].value[0].fpVal || 0);
      }
    }

    if (sleepData.session && sleepData.session.length > 0) {
      const totalSleepMillis = sleepData.session.reduce((acc, s) => acc + (parseInt(s.endTimeMillis) - parseInt(s.startTimeMillis)), 0);
      sleepMin = Math.round(totalSleepMillis / 60000);
    }

    const today = now.toISOString().split('T')[0];
    const reading = {
      user_id: userId,
      source: 'fitbit',
      reading_date: today,
      steps: steps > 0 ? steps : null,
      calories: null,
      sleep_min: sleepMin > 0 ? sleepMin : null,
      heart_rate: restingHr > 0 ? restingHr : null,
      raw_payload: { aggregateData, sleepData }
    };

    await supabase.from('wearable_readings').insert([reading]);
    res.status(200).json({ success: true, reading });
  } catch (err) {
    console.error('Fitbit Sync Error:', err);
    res.status(500).json({ error: 'Internal server error during sync' });
  }
}

// ─── Oura Ring ───────────────────────────────────────────────────────────────

function handleOuraAuth(req, res) {
  const { userId } = req.query || {};
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const clientId = process.env.OURA_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'OURA_CLIENT_ID not configured' });

  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/oura-callback`;

  const authUrl = new URL('https://cloud.ouraring.com/oauth/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'daily heart_rate personal sleep readiness');
  authUrl.searchParams.append('state', userId);

  res.redirect(authUrl.toString());
}

async function handleOuraCallback(req, res) {
  const { code, state, error } = req.query || {};
  if (error) return res.redirect(`/?error=oura_auth_denied`);
  if (!code || !state) return res.status(400).json({ error: 'Missing code or state parameter' });

  const userId = state;
  const clientId = process.env.OURA_CLIENT_ID;
  const clientSecret = process.env.OURA_CLIENT_SECRET;
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/oura-callback`;

  try {
    const tokenResponse = await fetch('https://api.ouraring.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      }).toString()
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return res.redirect(`/?error=oura_token_exchange_failed&details=${encodeURIComponent(tokenData.error_description || 'unknown_error')}`);
    }

    const supabase = getSupabase();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    await supabase.from('wearable_tokens').upsert({
      user_id: userId,
      provider: 'oura',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString()
    }, { onConflict: 'user_id, provider' });

    const { data: profile } = await supabase.from('profiles').select('connected_devices, syncing_devices').eq('id', userId).single();
    const existingDevices = profile?.connected_devices || {};
    const existingSyncing = profile?.syncing_devices || {};

    await supabase.from('profiles').update({
      connected_devices: { ...existingDevices, oura: true },
      syncing_devices: { ...existingSyncing, oura: true }
    }).eq('id', userId);

    res.redirect(`/?success=oura_connected`);
  } catch (err) {
    console.error('Oura Callback error:', err);
    res.redirect(`/?error=internal_server_error`);
  }
}

async function handleOuraDisconnect(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const supabase = getSupabase();
  try {
    await supabase.from('wearable_tokens').delete().eq('user_id', userId).eq('provider', 'oura');
    const { data: profile } = await supabase.from('profiles').select('connected_devices').eq('id', userId).single();
    if (profile && profile.connected_devices) {
      const devices = { ...profile.connected_devices };
      delete devices.oura;
      await supabase.from('profiles').update({ connected_devices: devices }).eq('id', userId);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Oura Disconnect Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to disconnect' });
  }
}

async function handleOuraSync(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const supabase = getSupabase();
  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from('wearable_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'oura')
      .single();

    if (tokenError || !tokenData) return res.status(401).json({ error: 'Oura not connected or token missing' });

    const accessToken = tokenData.access_token;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 2);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];
    const headers = { 'Authorization': `Bearer ${accessToken}` };

    const [sleepRes, activityRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${startDate}&end_date=${endDate}`, { headers })
    ]);

    if (!sleepRes.ok || !activityRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch data from Oura' });
    }

    const sleepData = await sleepRes.json();
    const activityData = await activityRes.json();
    const latestSleep = sleepData.data?.length > 0 ? sleepData.data[sleepData.data.length - 1] : null;
    const latestActivity = activityData.data?.length > 0 ? activityData.data[activityData.data.length - 1] : null;

    if (!latestSleep && !latestActivity) {
      return res.status(200).json({ message: 'No recent data available' });
    }

    const steps = latestActivity ? latestActivity.steps : null;
    const calories = latestActivity ? latestActivity.active_calories : null;
    const today = endDate;

    await supabase.from('wearable_readings').insert({
      user_id: userId,
      source: 'oura',
      reading_date: today,
      steps: steps,
      sleep_min: latestSleep ? Math.floor(latestSleep.contributors?.total_sleep / 60 || 0) || null : null,
      calories: calories,
      raw_payload: { sleep: sleepData, activity: activityData }
    });

    return res.status(200).json({ success: true, data: { steps, calories } });
  } catch (err) {
    console.error('Oura Sync Error:', err);
    return res.status(500).json({ error: err.message || 'Sync failed' });
  }
}

// ─── Device Sync Toggle ──────────────────────────────────────────────────────

async function handleSyncToggle(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, provider, enableSync } = req.body || {};
  if (!userId || !provider) return res.status(400).json({ error: 'Missing userId or provider' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  const token = authHeader.replace('Bearer ', '');

  const supabase = getSupabase();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authUser || authUser.id !== userId) {
    return res.status(403).json({ error: 'Forbidden: Cannot modify syncing devices for another user' });
  }

  try {
    const { data: profile } = await supabase.from('profiles').select('syncing_devices').eq('id', userId).single();
    const existingSyncing = profile?.syncing_devices || {};
    const updatedSyncing = { ...existingSyncing, [provider]: !!enableSync };

    await supabase.from('profiles').update({ syncing_devices: updatedSyncing }).eq('id', userId);
    res.status(200).json({ success: true, syncing_devices: updatedSyncing });
  } catch (err) {
    console.error('Sync Toggle Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const provider = req.query?.provider || req.body?.provider;
  const action = req.query?.action || req.body?.action;

  if (action === 'sync-toggle' || (!provider && action === 'toggle')) {
    return handleSyncToggle(req, res);
  }

  if (provider === 'fitbit') {
    switch (action) {
      case 'auth': return handleFitbitAuth(req, res);
      case 'callback': return handleFitbitCallback(req, res);
      case 'disconnect': return handleFitbitDisconnect(req, res);
      case 'sync': return handleFitbitSync(req, res);
      default: return res.status(400).json({ error: 'Invalid Fitbit action' });
    }
  }

  if (provider === 'oura') {
    switch (action) {
      case 'auth': return handleOuraAuth(req, res);
      case 'callback': return handleOuraCallback(req, res);
      case 'disconnect': return handleOuraDisconnect(req, res);
      case 'sync': return handleOuraSync(req, res);
      default: return res.status(400).json({ error: 'Invalid Oura action' });
    }
  }

  return res.status(400).json({ error: 'Missing or invalid provider/action' });
}
