// app/api/setting/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, type } = body;

        if (!userId) {
            return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
        }

        let message = "";

        if (type === "password_change") {
            message = "Security Alert: Password changed successfully.";
        } else if (type === "profile_update") {
            message = "Profile updated successfully.";
        } else if (type === "profile_picture_update") { // ⭐ Add this
            message = "Profile picture updated successfully.";
        }

        const { error } = await supabaseAdmin.from("notifications").insert({
            user_id: userId,
            message,
            is_read: false
        });

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}