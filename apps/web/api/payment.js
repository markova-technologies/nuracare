import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// ─── Supabase Client Helper ──────────────────────────────────────────────────
function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

function generateRef(prefix = 'NC') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function isSandboxMode() {
  const hasTelebirr = process.env.TELEBIRR_APP_ID && !String(process.env.TELEBIRR_APP_ID).includes('your_');
  const hasCBE = process.env.CBE_MERCHANT_ID && !String(process.env.CBE_MERCHANT_ID).includes('your_');
  return !hasTelebirr && !hasCBE;
}

// ─── Chapa Subscription Payments ─────────────────────────────────────────────

async function handleChapaCheckout(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, amount, planName } = req.body || {};
  const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;
  const mockUrl = `/?payment=success&mock=chapa&plan=${planName}`;
  
  if (!CHAPA_SECRET || String(CHAPA_SECRET).includes('your_secret_key')) {
    return res.status(200).json({ checkoutUrl: mockUrl });
  }

  const tx_ref = `NURA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const finalAmount = amount || 300;
  const finalPlanName = planName || 'Premium';

  try {
    const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency: 'ETB',
        email: email || 'user@nuracare.com',
        first_name: name || 'User',
        tx_ref: tx_ref,
        callback_url: `https://${req.headers.host}/api/chapa-verify?tx_ref=${tx_ref}`,
        return_url: `https://${req.headers.host}/?payment=success`,
        customization: {
          title: `NuraCare ${finalPlanName}`,
          description: `Unlock ${finalPlanName} health tracking and features.`
        }
      })
    });

    const data = await chapaRes.json();
    if (data.status === 'success') {
      return res.status(200).json({ checkoutUrl: data.data.checkout_url });
    } else {
      console.error('Chapa API Error:', data);
      throw new Error(data.message || 'Chapa initialization failed');
    }
  } catch (err) {
    console.error('Chapa Checkout Error:', err);
    return res.status(200).json({ checkoutUrl: mockUrl });
  }
}

async function handleChapaVerify(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const tx_ref = req.query.tx_ref || (req.body && req.body.tx_ref);
  const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;

  if (!tx_ref) return res.status(400).json({ error: 'Missing tx_ref' });

  if (!CHAPA_SECRET || String(CHAPA_SECRET).includes('your_secret_key')) {
    console.log(`[Chapa Verify Simulation] Verified tx_ref: ${tx_ref}`);
    return res.status(200).json({ status: 'success', message: 'Simulated verification' });
  }

  try {
    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${CHAPA_SECRET}` }
    });

    const data = await verifyRes.json();
    if (data.status === 'success') {
      const email = data.data.email;
      const supabase = getSupabase();
      if (email) {
        await supabase.from('users').update({ is_premium: true }).eq('email', email);
      }
      return res.status(200).json({ status: 'success', message: 'Payment verified' });
    } else {
      return res.status(400).json({ status: 'failed', message: 'Verification failed' });
    }
  } catch (err) {
    console.error('Chapa Verify Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── Stripe Subscription Payments ────────────────────────────────────────────

async function handleStripeCheckout(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, planName } = req.body || {};
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const mockUrl = `/?payment=success&mock=stripe&plan=${planName}`;

  if (!STRIPE_SECRET || String(STRIPE_SECRET).includes('your_secret_key')) {
    return res.status(200).json({ checkoutUrl: mockUrl });
  }

  const finalPlanName = planName || 'Premium';
  const unitAmount = finalPlanName.toLowerCase() === 'pro' ? 300 : 500;

  try {
    const stripe = new Stripe(STRIPE_SECRET);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `NuraCare ${finalPlanName}`,
            description: `Unlock ${finalPlanName} health tracking and features.`
          },
          unit_amount: unitAmount,
          recurring: { interval: 'month' }
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `https://${req.headers.host}/?payment=success`,
      cancel_url: `https://${req.headers.host}/?payment=cancel`,
    });

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return res.status(200).json({ checkoutUrl: mockUrl });
  }
}

// ─── Telebirr Challenge Payments ──────────────────────────────────────────────

async function initiateTelebirrPayment({ amount, userId, challengeId, txRef, returnUrl, callbackUrl }) {
  const APP_ID = process.env.TELEBIRR_APP_ID;
  const APP_KEY = process.env.TELEBIRR_APP_KEY;
  const SHORT_CODE = process.env.TELEBIRR_SHORT_CODE;
  const BASE_URL = process.env.TELEBIRR_BASE_URL || 'https://api.telebirr.com/api/v1';

  if (isSandboxMode()) {
    console.log(`[Telebirr Sandbox] Simulating payment of ${amount} ETB for challenge ${challengeId}`);
    return {
      success: true,
      sandbox: true,
      checkoutUrl: `${returnUrl}?payment=success&method=telebirr&tx_ref=${txRef}`,
      txRef
    };
  }

  const payload = {
    appId: APP_ID,
    shortCode: SHORT_CODE,
    outTradeNo: txRef,
    totalAmount: String(amount),
    subject: `NuraCare Challenge Entry (${challengeId})`,
    timeoutExpress: '30m',
    notifyUrl: callbackUrl,
    returnUrl,
    timestamp: String(Math.floor(Date.now() / 1000)),
    nonce: Math.random().toString(36).substring(2, 14),
  };

  try {
    const resp = await fetch(`${BASE_URL}/payment/unifiedorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APP_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (data.code === '0' || data.status === 'success') {
      return { success: true, checkoutUrl: data.data?.checkoutUrl || data.data?.toPayUrl, txRef };
    }
    throw new Error(data.message || 'Telebirr initiation failed');
  } catch (err) {
    console.error('[Telebirr] Payment error:', err);
    throw err;
  }
}

async function verifyTelebirrPayment(txRef) {
  if (isSandboxMode()) {
    return { verified: true, sandbox: true, txRef };
  }
  const APP_KEY = process.env.TELEBIRR_APP_KEY;
  const BASE_URL = process.env.TELEBIRR_BASE_URL || 'https://api.telebirr.com/api/v1';
  const resp = await fetch(`${BASE_URL}/payment/query?outTradeNo=${txRef}`, {
    headers: { 'Authorization': `Bearer ${APP_KEY}` },
  });
  const data = await resp.json();
  return { verified: data.code === '0' && data.data?.tradeState === 'SUCCESS', data };
}

// ─── CBE Birr Challenge Payments ──────────────────────────────────────────────

async function initiateCBEPayment({ amount, userId, challengeId, txRef, returnUrl, callbackUrl }) {
  const MERCHANT_ID = process.env.CBE_MERCHANT_ID;
  const SECRET_KEY = process.env.CBE_SECRET_KEY;
  const BASE_URL = process.env.CBE_BASE_URL || 'https://api.cbebirr.com/v1';

  if (isSandboxMode()) {
    console.log(`[CBE Birr Sandbox] Simulating payment of ${amount} ETB for challenge ${challengeId}`);
    return {
      success: true,
      sandbox: true,
      checkoutUrl: `${returnUrl}?payment=success&method=cbe&tx_ref=${txRef}`,
      txRef
    };
  }

  const payload = {
    merchantId: MERCHANT_ID,
    amount: String(amount),
    currency: 'ETB',
    reference: txRef,
    description: `NuraCare Challenge (${challengeId})`,
    callbackUrl,
    returnUrl,
  };

  try {
    const resp = await fetch(`${BASE_URL}/transactions/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret-Key': SECRET_KEY,
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (data.status === 'pending' || data.success) {
      return { success: true, checkoutUrl: data.redirectUrl || data.paymentUrl, txRef };
    }
    throw new Error(data.message || 'CBE Birr initiation failed');
  } catch (err) {
    console.error('[CBE Birr] Payment error:', err);
    throw err;
  }
}

async function verifyCBEPayment(txRef) {
  if (isSandboxMode()) {
    return { verified: true, sandbox: true, txRef };
  }
  const SECRET_KEY = process.env.CBE_SECRET_KEY;
  const BASE_URL = process.env.CBE_BASE_URL || 'https://api.cbebirr.com/v1';
  const resp = await fetch(`${BASE_URL}/transactions/${txRef}`, {
    headers: { 'X-Secret-Key': SECRET_KEY },
  });
  const data = await resp.json();
  return { verified: data.status === 'completed', data };
}

// ─── Challenge Settlement Engine ──────────────────────────────────────────────

async function runSettlement(challengeId, adminKey) {
  if (adminKey !== (process.env.NURACARE_ADMIN_SECRET || process.env.ADMIN_SECRET_KEY)) {
    throw new Error('Unauthorized settlement attempt');
  }

  const supabase = getSupabase();

  const { data: challenge, error: cErr } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (cErr || !challenge) throw new Error('Challenge not found');

  const { data: members } = await supabase
    .from('challenge_members')
    .select('user_id, stake_amount, progress_percentage')
    .eq('challenge_id', challengeId)
    .gte('progress_percentage', 100);

  if (!members || members.length === 0) {
    const { data: allMembers } = await supabase
      .from('challenge_members')
      .select('user_id, stake_amount')
      .eq('challenge_id', challengeId);

    for (const m of (allMembers || [])) {
      if (m.stake_amount > 0) {
        await supabase.from('wallet_accounts')
          .upsert({ user_id: m.user_id, withdrawable_balance: m.stake_amount }, { onConflict: 'user_id' });
        await supabase.from('wallet_transactions').insert({
          user_id: m.user_id,
          type: 'refund',
          amount: m.stake_amount,
          currency: challenge.currency || 'ETB',
          challenge_id: challengeId,
          status: 'completed',
          reference_id: generateRef('REFUND'),
          notes: `Refund: no completers for "${challenge.title}"`
        });
      }
    }

    await supabase.from('challenges').update({ status: 'completed' }).eq('id', challengeId);
    return { settled: true, type: 'refund_all', completers: 0 };
  }

  const prizePool = challenge.prize_pool || 0;
  const creatorReward = (challenge.gross_pool || 0) * ((challenge.creator_reward_pct || 2) / 100);
  const payoutPerWinner = members.length > 0 ? prizePool / members.length : 0;

  for (const m of members) {
    if (payoutPerWinner > 0) {
      const { data: walletRow } = await supabase
        .from('wallet_accounts')
        .select('withdrawable_balance, challenge_winnings')
        .eq('user_id', m.user_id)
        .single();

      await supabase.from('wallet_accounts').upsert({
        user_id: m.user_id,
        withdrawable_balance: (walletRow?.withdrawable_balance || 0) + payoutPerWinner,
        challenge_winnings: (walletRow?.challenge_winnings || 0) + payoutPerWinner,
      }, { onConflict: 'user_id' });

      await supabase.from('wallet_transactions').insert({
        user_id: m.user_id,
        type: 'prize_payout',
        amount: payoutPerWinner,
        currency: challenge.currency || 'ETB',
        challenge_id: challengeId,
        status: 'completed',
        reference_id: generateRef('WIN'),
        notes: `Prize: "${challenge.title}" — ${members.length} completers`
      });
    }
  }

  if (creatorReward > 0 && challenge.creator_id) {
    const { data: cWallet } = await supabase
      .from('wallet_accounts')
      .select('creator_rewards')
      .eq('user_id', challenge.creator_id)
      .single();

    await supabase.from('wallet_accounts').upsert({
      user_id: challenge.creator_id,
      creator_rewards: (cWallet?.creator_rewards || 0) + creatorReward,
    }, { onConflict: 'user_id' });

    await supabase.from('wallet_transactions').insert({
      user_id: challenge.creator_id,
      type: 'creator_reward',
      amount: creatorReward,
      currency: challenge.currency || 'ETB',
      challenge_id: challengeId,
      status: 'completed',
      reference_id: generateRef('CREATOR'),
      notes: `Creator reward: "${challenge.title}"`
    });
  }

  await supabase.from('challenges').update({ status: 'completed' }).eq('id', challengeId);

  return {
    settled: true,
    type: 'split_all_verified_completers',
    completers: members.length,
    payoutPerWinner,
    creatorReward
  };
}

async function handleStakeCollect(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, challengeId, amount, method, returnUrl } = req.body || {};
  if (!userId || !challengeId || !amount) {
    return res.status(400).json({ error: 'Missing required fields: userId, challengeId, amount' });
  }
  if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

  const txRef = generateRef('STAKE');
  const host = `https://${req.headers.host}`;
  const callbackUrl = `${host}/api/payment?action=verify-callback&method=${method}&tx_ref=${txRef}`;
  const finalReturnUrl = returnUrl || `${host}/?challenge=${challengeId}&payment=success`;

  try {
    let result;
    if (method === 'cbe') {
      result = await initiateCBEPayment({ amount, userId, challengeId, txRef, returnUrl: finalReturnUrl, callbackUrl });
    } else {
      result = await initiateTelebirrPayment({ amount, userId, challengeId, txRef, returnUrl: finalReturnUrl, callbackUrl });
    }

    if (!result.success) {
      return res.status(502).json({ error: 'Payment gateway error', details: result });
    }

    const supabase = getSupabase();
    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      type: 'stake_entry',
      amount,
      currency: 'ETB',
      challenge_id: challengeId,
      status: 'pending',
      reference_id: txRef,
      notes: `Challenge entry stake via ${method === 'cbe' ? 'CBE Birr' : 'Telebirr'}${result.sandbox ? ' (sandbox)' : ''}`
    });

    return res.status(200).json({
      checkoutUrl: result.checkoutUrl,
      txRef,
      sandbox: result.sandbox || false
    });
  } catch (err) {
    console.error('[ChallengePayment] stake-collect error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

async function handleVerifyCallback(req, res) {
  const txRef = req.query?.tx_ref || req.body?.tx_ref;
  const method = req.query?.method || req.body?.method || 'telebirr';

  if (!txRef) return res.status(400).json({ error: 'Missing tx_ref' });

  try {
    const verification = method === 'cbe'
      ? await verifyCBEPayment(txRef)
      : await verifyTelebirrPayment(txRef);

    if (verification.verified) {
      const supabase = getSupabase();
      await supabase.from('wallet_transactions')
        .update({ status: 'completed' })
        .eq('reference_id', txRef);

      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('user_id, amount, challenge_id')
        .eq('reference_id', txRef)
        .single();

      if (txData) {
        await supabase.from('challenge_members')
          .update({ stake_amount: txData.amount, status: 'active' })
          .eq('challenge_id', txData.challenge_id)
          .eq('user_id', txData.user_id);

        const { data: ch } = await supabase
          .from('challenges')
          .select('gross_pool, prize_pool, platform_fee_pct, creator_reward_pct')
          .eq('id', txData.challenge_id)
          .single();

        if (ch) {
          const newGross = (ch.gross_pool || 0) + txData.amount;
          const platformFee = newGross * ((ch.platform_fee_pct || 10) / 100);
          const creatorFee = newGross * ((ch.creator_reward_pct || 2) / 100);
          const newPrize = newGross - platformFee - creatorFee;
          await supabase.from('challenges')
            .update({ gross_pool: newGross, prize_pool: newPrize })
            .eq('id', txData.challenge_id);
        }
      }

      return res.status(200).json({ status: 'verified', sandbox: verification.sandbox || false });
    } else {
      await getSupabase().from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('reference_id', txRef);
      return res.status(400).json({ status: 'failed' });
    }
  } catch (err) {
    console.error('[ChallengePayment] verify-callback error:', err);
    return res.status(500).json({ error: 'Verification failed', message: err.message });
  }
}

async function handlePrizePayout(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { challengeId, adminKey } = req.body || {};
  if (!challengeId) return res.status(400).json({ error: 'Missing challengeId' });

  try {
    const result = await runSettlement(challengeId, adminKey);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[ChallengePayment] settlement error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── Main Dispatcher ─────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query?.action || req.body?.action;

  switch (action) {
    case 'chapa-checkout':
      return handleChapaCheckout(req, res);
    case 'chapa-verify':
      return handleChapaVerify(req, res);
    case 'stripe-checkout':
      return handleStripeCheckout(req, res);
    case 'stake-collect':
      return handleStakeCollect(req, res);
    case 'verify-callback':
      return handleVerifyCallback(req, res);
    case 'prize-payout':
    case 'settlement':
      return handlePrizePayout(req, res);
    default:
      return res.status(400).json({
        error: 'Invalid action',
        validActions: ['chapa-checkout', 'chapa-verify', 'stripe-checkout', 'stake-collect', 'verify-callback', 'prize-payout', 'settlement']
      });
  }
}
