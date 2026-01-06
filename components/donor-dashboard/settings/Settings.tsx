// components/donor-dashboard/settings/Settings.tsx
import { BaseUser } from "@/types/ngo";
import ProfileSection from "./ProfileSection";
import SecuritySection from "./SecuritySection";
import DeleteAccount from "./DeleteAccount";

interface SettingsPageProps {
  user: BaseUser;
  profileImageUrl?: string | null; // ⭐ Add this
}

export default async function SettingsPage({ user, profileImageUrl }: SettingsPageProps) {

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24 space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile details and security.</p>
      </div>

      <ProfileSection profile={user} profileImageUrl={profileImageUrl} /> {/* ⭐ Pass it here */}
      <SecuritySection profile={user} />
      <DeleteAccount profile={user} />
    </div>
  );
}