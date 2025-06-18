
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "@/lib/api/social-api";
import {
  getCurrentUserProfile,
  getFollowing,
  getFollowers
} from "@/lib/api/social-api";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadConnections();
    }
    // eslint-disable-next-line
  }, [user]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const currentProfile = await getCurrentUserProfile();
      if (currentProfile) setProfile(currentProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const [followingList, followersList] = await Promise.all([
        getFollowing(),
        getFollowers(),
      ]);
      setFollowing(followingList);
      setFollowers(followersList);
    } catch (error) {
      console.error("Error loading connections:", error);
    }
  };

  if (!user) {
    return (
      <div className="container py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access your profile.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = "/auth"}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="container py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <ProfileOverview profile={profile} />
          </div>
          <div className="md:w-2/3">
            <ProfileTabs
              profile={profile}
              following={following}
              followers={followers}
              loadProfile={loadProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
