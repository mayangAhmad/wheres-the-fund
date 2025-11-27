"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import createClient from "@/lib/supabase/server";
import { registerUser } from "@/lib/services/userService"; // Reusing your existing service
import { loginSchema } from "@/lib/validation/userLoginSchema";
import { ngoSignupSchema } from "@/lib/validation/ngoSignupSchema";
import { donorSignupSchema } from "@/lib/validation/donorSignupSchema";

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// --- 1. LOGIN ACTION ---
export async function loginNgoAction(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  // Extract & Validate
  const rawData = Object.fromEntries(formData);
  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Invalid email or password format" };
  }

  const { email, password } = validated.data;

  // Supabase Auth (Sets Cookie automatically)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  // Server-Side Role Check (The 404 Fix)
  // We query the DB directly before the user ever moves pages.
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const role = profile?.role || "donor";

  // Redirect Logic
  if (role === "ngo") {
    revalidatePath("/", "layout"); // Clear cache
    redirect("/ngo/dashboard");    // Atomic Redirect
  } else {
    redirect("/donor/dashboard");
  }
}

export async function registerNgoAction(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const rawData = Object.fromEntries(formData);
  const validated = ngoSignupSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Invalid form data. Please check your inputs." };
  }

  const { email, password, orgName, ssmNumber } = validated.data;

  //SSM VERIFICATION 
  try {
    const mockUrl = new URL("https://68f342dafd14a9fcc4283dd6.mockapi.io/ngos/ngos-verification");
    mockUrl.searchParams.append("ssmNumber", ssmNumber.trim());

    const ssmRes = await fetch(mockUrl.toString(), { 
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: 'no-store'
    });

    if (!ssmRes.ok) {
      return { error: "SSM Verification service is currently unavailable." };
    }

    const ssmData = await ssmRes.json();
    
    const isValidSSM = Array.isArray(ssmData) && ssmData.length > 0;

    if (!isValidSSM) {
      return { error: "Invalid SSM Number. Organization not found." };
    }
    
  } catch (error) {
    console.error("SSM Check Error:", error);
    return { error: "Failed to verify SSM number." };
  }

  // 3. Create Auth User (Only happens if SSM check passes)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: orgName, role: "ngo", ssm_number: ssmNumber } },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Something went wrong creating the user." };

  // 4. Atomic Profile Creation
  try {
    await registerUser({
      id: authData.user.id,
      email,
      name: orgName,
      role: "ngo",
      ssm_number: ssmNumber,
    });
  } catch (err: any) {
    return { error: err.message || "Failed to create profile." };
  }

  // 5. Redirect
  redirect("/auth/login?message=Registration successful! Please log in.");
}

// --- 3. DONOR LOGIN ACTION ---
export async function loginDonorAction(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const rawData = Object.fromEntries(formData);
  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Invalid email or password format" };
  }

  const { email, password } = validated.data;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) return { error: authError.message };

  // Server-Side Role Check
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const role = profile?.role || "donor";

  if (role === "donor") {
    revalidatePath("/", "layout");
    redirect("/donor/dashboard");
  } else {
    // If an NGO tries to login here, send them to their dashboard
    redirect("/ngo/dashboard");
  }
}

// --- 4. DONOR REGISTER ACTION ---
export async function registerDonorAction(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const rawData = Object.fromEntries(formData);
  const validated = donorSignupSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Invalid form data." };
  }

  const { email, password, name } = validated.data;

  // Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: "donor" } },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "User creation failed." };

  // Atomic Profile Creation
  try {
    await registerUser({
      id: authData.user.id,
      email,
      name,
      role: "donor",
    });
  } catch (err: any) {
    return { error: err.message || "Failed to create profile." };
  }

  redirect("/auth/login?message=Registration successful! Please log in.");
}