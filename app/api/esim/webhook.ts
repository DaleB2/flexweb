// app/api/esim/webhook.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { sendOrderReadyEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const orderNo = payload.content?.orderNo;
  if (!orderNo) return NextResponse.json({ ok: true });

  // Fetch eSIM details (stub for now)
  // TODO: call esimapi query

  // Update DB & send email when ready
  const supabase = getSupabaseAdmin();

  if (supabase) {
    await supabase
      .from('orders')
      .update({
        status: 'ready',
        iccid: payload.content.iccid,
        qr_code_url: payload.content.qrCodeUrl,
      })
      .eq('order_no', orderNo);

    const { data: order } = await supabase
      .from('orders')
      .select('user_id, iccid, qr_code_url')
      .eq('order_no', orderNo)
      .single();

    if (order?.user_id) {
      const { data: user } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', order.user_id)
        .single();

      if (user?.email && order.iccid && order.qr_code_url) {
        await sendOrderReadyEmail({ to: user.email, iccid: order.iccid, qrUrl: order.qr_code_url });
      }
    }
  }

  return NextResponse.json({ received: true });
}
