import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SparkProfile, toggleSpark } from "@/lib/api/spark-api";
import { toast } from "sonner";
import { useState } from "react";
import { formatSparksWithPoints } from "@/utils/sparkDisplay";

// ✅ Local fallback avatars
import pfp1 from "@/assets/pfp/pfp1.png";
import pfp2 from "@/assets/pfp/pfp2.png";
import pfp3 from "@/assets/pfp/pfp3.png";
import pfp4 from "@/assets/pfp/pfp4.png";
const fallbackAvatars = [pfp1, pfp2, pfp3, pfp4];

// ✅ Avatar selector based on user ID
function getFallbackAvatar(userId?: string): string {
  const index = userId ? parseInt(userId.replace(/\D/g, "").slice(-1)) % fallbackAvatars.length : 0;
  return fallbackAvatars[index];
}

interface ProfileCardProps {
  profile: SparkProfile;
  onProfileClick: (profile: SparkProfile) => void;
  onSparkToggled: () => void;
}

export function ProfileCard({ profile, onProfileClick, onSparkToggled }: ProfileCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localSparkCount, setLocalSparkCount] = useState(profile.spark_count);
  const [sparked, setSparked] = useState(profile.sparked);

  const getHobbies = (hobbiesString: string | null): string[] => {
    if (!hobbiesString) return [];
    return hobbiesString.split(",").map((hobby) => hobby.trim()).filter(Boolean);
  };

  const handleToggleSpark = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    const nextSparked = !sparked;
    setSparked(nextSparked);
    setLocalSparkCount((prev) => nextSparked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const response = await toggleSpark(profile.id, nextSparked);
      if (response?.success) {
        setLocalSparkCount(response.newCount ?? profile.spark_count);
        profile.spark_count = response.newCount ?? profile.spark_count;
        profile.sparked = nextSparked;
        toast.success(nextSparked ? "Added to sparked friends" : "Removed from sparked friends");
        onSparkToggled();
      } else {
        throw new Error("Toggle failed on server");
      }
    } catch (error) {
      console.error("Error toggling spark:", error);
      setSparked(!nextSparked);
      setLocalSparkCount(profile.spark_count);
      toast.error("Failed to update spark status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onProfileClick(profile)}
          >
            <Avatar className="bg-primary w-10 h-10">
              <img
                src={getFallbackAvatar(profile.id)}
                alt={profile.display_name || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            </Avatar>
            <div>
              <CardTitle className="text-base">{profile.display_name}</CardTitle>
              <CardDescription>
                @{profile.username}
                <span className="ml-2 text-blue-500 font-medium">
                  {formatSparksWithPoints(localSparkCount)}
                </span>
              </CardDescription>
            </div>
          </div>

          <Button
            onClick={handleToggleSpark}
            variant={sparked ? "secondary" : "default"}
            className="text-sm px-3"
            disabled={isUpdating}
          >
            {sparked ? (
              <>
                <BookmarkCheck className="mr-2 h-4 w-4" /> UnSpark
              </>
            ) : (
              <>
                <Bookmark className="mr-2 h-4 w-4" /> Spark
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <p className="text-muted-foreground">Age:</p>
            <p>{profile.age || "Not specified"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Class/Education:</p>
            <p>{profile.education || "Not specified"}</p>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-muted-foreground text-sm">Hobbies:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {getHobbies(profile.hobbies).map((hobby) => (
              <Badge key={hobby} variant="outline">{hobby}</Badge>
            ))}
            {getHobbies(profile.hobbies).length === 0 && (
              <p className="text-sm text-muted-foreground">No hobbies specified</p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
        {profile.instagram && (
          <Button variant="outline" size="sm" className="text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide mr-1 lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            {profile.instagram}
          </Button>
        )}
        {profile.discord && (
          <Button variant="outline" size="sm" className="text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide mr-1 lucide-discord"><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M7.5 7.2c3.7-1 5.8-1 8.5 0" /><path d="M7.5 16.8c3.7 1 5.8 1 8.5 0" /><path d="M15.5 17 17 20l2-2 4 1-3-4" /><path d="M8.5 17 7 20l-2-2-4 1 3-4" /><path d="M12 22c-3.03 0-5.8-.88-7.5-2.25L4 18" /><path d="M12 22c3.03 0 5.8-.88 7.5-2.25l.5-1.75" /><path d="M12 2c3.03 0 5.8.88 7.5 2.25l.5 1.75" /><path d="M12 2C8.97 2 6.2 2.88 4.5 4.25L4 6" /></svg>
            {profile.discord}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
