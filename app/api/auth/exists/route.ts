import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabaseClient";

interface EmailLookupBody {
  email?: string;
}

export async function POST(request: Request) {
  const { email } = (await request.json()) as EmailLookupBody;

  if (!email) {
    return NextResponse.json({ exists: false, error: "Email required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ exists: false });
  }

  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      email,
    });

    if (error) {
      throw error;
    }

    const exists = Boolean(data?.users?.length);
    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Failed to look up email", error);
    return NextResponse.json({ exists: false });
  }
}
