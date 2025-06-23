
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Heart, UserCheck } from "lucide-react";
import type { UserProfile } from "@/lib/api/social-api";
import { ProfileEditTab } from "./tabs/ProfileEditTab";
import { ProfileUploadedTab } from "./tabs/ProfileUploadedTab";
import { ProfileBookmarkedTab } from "./tabs/ProfileBookmarkedTab";
import { ProfileFollowingTab } from "./tabs/ProfileFollowingTab";
import { ProfileFollowersTab } from "./tabs/ProfileFollowersTab";

interface Props {
  profile: UserProfile;
  following: UserProfile[];
  followers: UserProfile[];
  loadProfile: () => Promise<void>;
}

export const ProfileTabs: React.FC<Props> = ({
  profile,
  following,
  followers,
  loadProfile,
}) => {
  return (
    <Tabs defaultValue="edit" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        <TabsTrigger value="my-stories">My Stories</TabsTrigger>
        <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        <TabsTrigger value="following">
          <Users className="w-4 h-4 mr-2" />
          Following ({following.length})
        </TabsTrigger>
        <TabsTrigger value="followers">
          <Heart className="w-4 h-4 mr-2" />
          Followers ({followers.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <ProfileEditTab profile={profile} loadProfile={loadProfile} />
      </TabsContent>
      <TabsContent value="my-stories">
        <ProfileUploadedTab />
      </TabsContent>
      <TabsContent value="bookmarked">
        <ProfileBookmarkedTab />
      </TabsContent>
      <TabsContent value="following">
        <ProfileFollowingTab following={following} />
      </TabsContent>
      <TabsContent value="followers">
        <ProfileFollowersTab followers={followers} />
      </TabsContent>
    </Tabs>
  );
};
