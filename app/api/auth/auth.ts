"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import createClient from "@/lib/supabase/server";
import { registerUser } from "@/lib/services/userService";
import { loginSchema } from "@/lib/validation/userLoginSchema";
import { ngoSignupSchema } from "@/lib/validation/ngoSignupSchema";
import { donorSignupSchema } from "@/lib/validation/donorSignupSchema";

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// --- 1. LOGIN ACTION (NGO) ---
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

  // Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  // Fetch Role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const role = profile?.role || "donor";

  // 🚦 TRAFFIC CONTROLLER
  if (role === "admin") {
    redirect("/admin/dashboard");
  }

  if (role === "ngo") {
    revalidatePath("/", "layout");
    redirect("/ngo/dashboard");
  } else {
    // If a donor tries to login here, send them to their dashboard
    redirect("/donor/dashboard");
  }
}

// --- 2. REGISTER ACTION (NGO) ---
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

  // SSM VERIFICATION 
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

  // Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: orgName, role: "ngo", ssm_number: ssmNumber } },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Something went wrong creating the user." };

  // Atomic Profile Creation
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

  redirect("/auth/login?message=Registration successful! Please log in.");
}

// --- 3. LOGIN ACTION (DONOR/ADMIN) ---
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

  // Fetch Role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const role = profile?.role || "donor";

  // 🚦 TRAFFIC CONTROLLER
  if (role === "admin") {
    redirect("/admin/dashboard");
  }

  if (role === "donor") {
    revalidatePath("/", "layout");
    redirect("/donor/dashboard");
  } else {
    // If an NGO tries to login here, send them to their dashboard
    redirect("/ngo/dashboard");
  }
}

// --- 4. REGISTER ACTION (DONOR) ---
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