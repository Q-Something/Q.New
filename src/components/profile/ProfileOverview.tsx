import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileLeaderboardSummary } from "@/components/profile/ProfileLeaderboardSummary";
import { ProfileStreakSummary } from "@/components/profile/ProfileStreakSummary";
import type { UserProfile } from "@/lib/api/social-api";

// 🖼️ Import your default PFPs
import pfp1 from "@/assets/pfp/pfp1.png";
import pfp2 from "@/assets/pfp/pfp2.png";
import pfp3 from "@/assets/pfp/pfp3.png";
import pfp4 from "@/assets/pfp/pfp4.png";

export function ProfileOverview({ profile }: { profile: UserProfile }) {
  const [imageError, setImageError] = useState(false);

  // ✅ Utility to parse hobbies
  const getHobbies = (hobbiesString: string | null): string[] => {
    if (!hobbiesString) return [];
    return hobbiesString
      .split(",")
      .map((hobby) => hobby.trim())
      .filter(Boolean);
  };

  // 🎲 Fallback avatar selection
  const fallbackAvatars = [pfp1, pfp2, pfp3, pfp4];
  const fallbackIndex = profile.id
    ? parseInt(profile.id.replace(/\D/g, "").slice(-1)) % 4
    : 0;
  const assignedPfp = profile.avatar_url || fallbackAvatars[fallbackIndex];

  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          {!imageError && (
            <AvatarImage
              src={assignedPfp}
              alt="Profile"
              onError={() => setImageError(true)}
            />
          )}
          {(imageError || !assignedPfp) && (
            <AvatarFallback className="text-2xl">
              {profile.display_name?.substring(0, 2).toUpperCase() || "ST"}
            </AvatarFallback>
          )}
        </Avatar>

        <CardTitle>{profile.display_name || "Unnamed User"}</CardTitle>
        <CardDescription>@{profile.uid || "no-uid"}</CardDescription>

        {profile.id && (
          <div className="flex flex-col items-center gap-1 mt-2">
            <ProfileLeaderboardSummary userId={profile.id} />
            <ProfileStreakSummary userId={profile.id} />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-500">
              {profile.followers_count || 0}
            </p>
            <p className="text-sm text-muted-foreground">Sparks</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">
              {profile.following_count || 0}
            </p>
            <p className="text-sm text-muted-foreground">Sparked</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-500">
              {profile.mutual_sparks_count || 0}
            </p>
            <p className="text-sm text-muted-foreground">Mutual</p>
          </div>
        </div>

        {!!profile.hobbies && (
          <div>
            <span className="text-sm font-medium">Hobbies</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {getHobbies(profile.hobbies).map((hobby) => (
                <Badge key={hobby} variant="outline" className="text-xs">
                  {hobby}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
