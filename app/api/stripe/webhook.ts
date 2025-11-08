// app/api/stripe/webhook.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabaseClient';
import { orderEsim } from '../../../lib/orderEsim';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,);
export const config = { api: { bodyParser: false } };

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const buf = await buffer(req.body);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const email = pi.receipt_email!;
    const draft = JSON.parse(pi.metadata.orderDraft as string);

    // ensure user
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    let userId = profile?.id!;
    if (!userId) {
      const { data: newUser } = await supabase.auth.admin.createUser({ email, email_confirm: true });
      userId = newUser!.user!.id;
      await supabase.from('profiles').insert({ id: userId, email });
    }

    // perform eSIM order
    const o = await orderEsim(draft);

    await supabase.from('orders').insert({
      user_id: userId,
      status: 'provisioning',
      stripe_pi_id: pi.id,
      country_code: draft.country_code,
      region_code: draft.region_code,
      package_code: draft.package_code,
      slug: draft.slug,
      period_num: draft.periodNum,
      wholesale_cents: draft.wholesale_cents,
      markup_pct: draft.markup_pct,
      total_cents: draft.total_cents,
      currency: draft.currency,
      transaction_id: o.orderNo,
      order_no: o.orderNo,
    });
  }

  return NextResponse.json({ received: true });
}
