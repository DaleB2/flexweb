// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { email, total_cents, currency, orderDraft } = await req.json();

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ requiresLogin: true }, { status: 409 });
  }

  const pi = await stripe.paymentIntents.create({
    amount: total_cents,
    currency: currency,
    receipt_email: email,
    automatic_payment_methods: { enabled: true },
    metadata: { email, orderDraft: JSON.stringify(orderDraft) },
  });

  return NextResponse.json({ clientSecret: pi.client_secret, paymentIntentId: pi.id });
}
