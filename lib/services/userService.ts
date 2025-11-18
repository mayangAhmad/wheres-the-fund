import { supabaseAdmin } from "@/lib/supabase/admin";
import { createWalletForUser } from "./walletService";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  ssm_number?: string;
}

export async function registerUser({ id, email, name, role, ssm_number }: UserData) {
  // 1. Check existing role to prevent overwrites
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", id)
    .single();

  const finalRole = existingUser?.role || role;

  // 2. Upsert User Profile (Public Users Table)
  const { error: upsertError } = await supabaseAdmin
    .from("users")
    .upsert({
      id,
      email,
      name,
      role: finalRole,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (upsertError) throw new Error(`DB Register Error: ${upsertError.message}`);

  // 3. Handle Profile Creation based on Role
  if (finalRole === 'ngo' && ssm_number) {
    // ✅ FIX: Your DB schema uses 'ngo_id', not 'user_id'
    const { error: ngoError } = await supabaseAdmin
      .from("ngo_profiles")
      .upsert({
        ngo_id: id, // <--- FIXED COLUMN NAME
        ssm_number: ssm_number
      }, { onConflict: 'ngo_id' });
      
    if (ngoError) console.error("Failed to save NGO profile:", ngoError.message);
  
  } else if (finalRole === 'donor') {
    // ✅ ADDED: Create Donor Profile row if missing
    const { error: donorError } = await supabaseAdmin
      .from("donor_profiles")
      .upsert({
        user_id: id, // Donor table uses 'user_id'
      }, { onConflict: 'user_id' });

    if (donorError) console.error("Failed to save Donor profile:", donorError.message);
  }

  // 4. Create Wallet (KMS)
  // Since we do this here, you can REMOVE the extra fetch("/api/user/setup-wallet") from your frontend!
  try {
    await createWalletForUser(id);
  } catch (walletError) {
    console.error("Wallet creation warning:", walletError);
    // We don't throw here because we don't want to block registration if KMS acts up
  }

  return { success: true, role: finalRole };
}