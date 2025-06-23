
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import type { UserProfile } from "@/lib/api/social-api";

export function ProfileEditTab({
  profile,
  loadProfile,
}: {
  profile: UserProfile;
  loadProfile: () => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Your Profile</CardTitle>
        <CardDescription>
          Update your information to connect with the right study partners
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProfileEditForm profile={profile} refreshProfile={loadProfile} />
      </CardContent>
    </Card>
  );
}
