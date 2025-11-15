//app/api/user/register/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

//insert user passed from signupDonor/Ngo

export async function POST(req: Request) {
  const body = await req.json();
  const { id, name, email, role, ssm_number } = body;

  const { error } = await supabaseAdmin.from("users").upsert(
    {
      id,
      name,
      email,
      role,
      ssm_number: role === "ngo" ? ssm_number ?? null : null,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("User insert error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
