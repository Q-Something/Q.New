import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SparkProfile, toggleSpark } from "@/lib/api/spark-api";
import { toast } from "sonner";
import { useState } from "react";
import { formatSparksWithPoints } from "@/utils/sparkDisplay";

interface ProfileDetailDialogProps {
  profile: SparkProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSparkToggled: () => void;
}

export function ProfileDetailDialog({
  profile,
  open,
  onOpenChange,
  onSparkToggled,
}: ProfileDetailDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localSparkCount, setLocalSparkCount] = useState<number | null>(null);

  if (!profile) return null;

  const currentSparkCount =
    localSparkCount !== null ? localSparkCount : profile.spark_count;

  const getHobbies = (hobbiesString: string | null): string[] => {
    if (!hobbiesString) return [];
    return hobbiesString
      .split(",")
      .map((hobby) => hobby.trim())
      .filter(Boolean);
  };

  const handleToggleSpark = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    const nextSparked = !profile.sparked;
    setLocalSparkCount(
      nextSparked ? currentSparkCount + 1 : Math.max(0, currentSparkCount - 1)
    );
    profile.sparked = nextSparked;

    try {
      const { success, newCount } = await toggleSpark(profile.id, nextSparked);
      if (success) {
        setLocalSparkCount(newCount ?? profile.spark_count);
        profile.spark_count = newCount ?? profile.spark_count;
        toast.success(
          nextSparked ? "Added to sparked friends" : "Removed from sparked friends"
        );
        onSparkToggled();
      } else {
        throw new Error("Server update failed");
      }
    } catch (err) {
      profile.sparked = !nextSparked;
      setLocalSparkCount(profile.spark_count);
      toast.error("Failed to update spark status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-primary">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.display_name || "User"} />
              ) : (
                <span className="h-12 w-12 flex items-center justify-center rounded-full bg-muted text-xl font-bold">
                  {profile.display_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{profile.display_name}</h2>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
                <span className="ml-2 text-blue-500 font-medium">
                  {formatSparksWithPoints(currentSparkCount)}
                </span>
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Connect with this study partner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Age</p>
              <p>{profile.age || "Not specified"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Education</p>
              <p>{profile.education || "Not specified"}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm mb-1">Hobbies</p>
            <div className="flex flex-wrap gap-1">
              {getHobbies(profile.hobbies).map((hobby) => (
                <Badge key={hobby} variant="outline">
                  {hobby}
                </Badge>
              ))}
              {getHobbies(profile.hobbies).length === 0 && (
                <p className="text-sm text-muted-foreground">No hobbies specified</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Social Media
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs">
                    📸 {profile.instagram}
                  </Button>
                </a>
              )}
              {profile.discord && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(profile.discord);
                    toast.success("Discord username copied");
                  }}
                >
                  💬 {profile.discord}
                </Button>
              )}
              {!profile.instagram && !profile.discord && (
                <p className="text-sm text-muted-foreground">
                  No social accounts listed
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleToggleSpark}
            variant={profile.sparked ? "secondary" : "default"}
            className="text-sm px-4"
            disabled={isUpdating}
          >
            {isUpdating
              ? "Updating..."
              : profile.sparked
              ? "UnSpark"
              : "Spark"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
