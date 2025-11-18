import { NextResponse } from "next/server";
import { registerUser } from "@/lib/services/userService";

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming JSON body
    const body = await request.json();
    
    // 2. Extract the fields we need
    // Note: We don't need to validate extensively here because:
    // - The Frontend (Zod) already validated the format.
    // - Supabase Auth already handled the initial user creation.
    const { id, email, name, role, ssm_number } = body;

    if (!id || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields: id, email, or role." },
        { status: 400 }
      );
    }

    // 3. Call the Service Layer
    // This function handles:
    // - Inserting into public.users
    // - Inserting into ngo_profiles OR donor_profiles
    // - Creating the KMS Wallet
    const result = await registerUser({
      id,
      email,
      name,
      role,
      ssm_number // This will be undefined for donors, which is fine
    });

    // 4. Return Success
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Registration API Error:", error);
    
    // Return a clean error message to the frontend
    return NextResponse.json(
      { error: error.message || "Internal Server Error during registration." }, 
      { status: 500 }
    );
  }
}