import createClient from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        console.log(`Requesting account deletion for: ${user.id}`);

        const { error: unlinkError } = await supabaseAdmin
            .from("donations")
            .update({ donor_id: null })
            .eq("donor_id", user.id);

        if (unlinkError) {
            console.error("Unlink Error:", unlinkError);
            return new NextResponse("Failed to unlink donations", { status: 500 });
        }

        await supabaseAdmin.from("notifications").delete().eq("user_id", user.id);

        await supabaseAdmin.from("donor_profiles").delete().eq("user_id", user.id);

        await supabaseAdmin.from("users").delete().eq("id", user.id);

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
            user.id
        );

        if (deleteError) {
            console.error("Delete Error:", deleteError);
            return new NextResponse(`Error: ${deleteError.message}`, { status: 500 });
        }

        return new NextResponse("Account Deleted", { status: 200 });
    } catch (error: any) {
        console.log("Server Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}