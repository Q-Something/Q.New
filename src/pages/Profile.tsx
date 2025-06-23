import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "@/lib/api/social-api";
import {
  getCurrentUserProfile,
  getFollowing,
  getFollowers,
} from "@/lib/api/social-api";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mbtiTypes = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP"
];

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [showMBTIDialog, setShowMBTIDialog] = useState(false);
  const [mbti, setMBTI] = useState("");
  const [savingMBTI, setSavingMBTI] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadConnections();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (profile && !profile.mbti) {
      setShowMBTIDialog(true);
    }
  }, [profile]);

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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const handleSaveMBTI = async () => {
    if (!mbti) {
      toast.error("Please select your MBTI type.");
      return;
    }
    setSavingMBTI(true);
    try {
      await updateUserProfile({ mbti });
      toast.success("Personality type saved!");
      setShowMBTIDialog(false);
      loadProfile();
    } catch (error) {
      toast.error("Failed to update personality type");
    } finally {
      setSavingMBTI(false);
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
            onClick={() => (window.location.href = "/auth")}
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
      <Dialog open={showMBTIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Personality Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={mbti} onValueChange={setMBTI} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your MBTI type" />
              </SelectTrigger>
              <SelectContent>
                {mbtiTypes.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button onClick={handleSaveMBTI} disabled={savingMBTI || !mbti} className="w-full">
                {savingMBTI ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Logout</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Yes, Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
