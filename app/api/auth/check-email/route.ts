import { NextResponse } from "next/server";

import { getSupabaseServiceClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase.auth.admin.listUsers({ email });

    if (error) {
      console.error(error);
      throw error;
    }

    const exists = (data?.users ?? []).some((user) => user.email?.toLowerCase() === email.toLowerCase());
    return NextResponse.json({ exists });
  } catch (error) {
    console.warn("Email check unavailable", error);
    return NextResponse.json({ exists: false, unavailable: true });
  }
}
