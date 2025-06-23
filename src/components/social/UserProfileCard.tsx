import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile, followUser, unfollowUser } from "@/lib/api/social-api";
import { toast } from "sonner";
import { useState } from "react";
import { MessageCircle, UserPlus, UserMinus } from "lucide-react";

interface UserProfileCardProps {
  profile: UserProfile;
  onProfileClick?: (profile: UserProfile) => void;
  onFollowToggled?: () => void;
  onMessageClick?: (profile: UserProfile) => void;
  showMessageButton?: boolean;
}

export function UserProfileCard({ 
  profile, 
  onProfileClick, 
  onFollowToggled, 
  onMessageClick,
  showMessageButton = false 
}: UserProfileCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(profile.is_following ?? false);
  
  const getHobbies = (hobbiesString: string | null): string[] => {
    if (!hobbiesString) return [];
    return hobbiesString.split(',').map(hobby => hobby.trim()).filter(Boolean);
  };

  const handleToggleFollow = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      if (isFollowing) {
        await unfollowUser(profile.id);
        setIsFollowing(false);
        toast.success("Unsparked successfully");
      } else {
        await followUser(profile.id);
        setIsFollowing(true);
        toast.success("Sparked successfully!");
      }
      if (onFollowToggled) onFollowToggled();
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update spark status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={() => onProfileClick?.(profile)}
          >
            <Avatar className="h-12 w-12">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              ) : (
                <span className="h-12 w-12 flex items-center justify-center rounded-full bg-muted text-xl font-bold">
                  {profile.display_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{profile.display_name}</CardTitle>
              <p className="text-sm text-muted-foreground">@{profile.uid}</p>
              <div className="flex gap-2 text-xs text-yellow-600 mt-1 font-medium">
                <span>{profile.followers_count} sparks</span>
                <span>•</span>
                <span>{profile.following_count} sparked</span>
                {profile.mutual_sparks_count > 0 && (
                  <>
                    <span>•</span>
                    <span>{profile.mutual_sparks_count} mutual</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <p className="text-muted-foreground">Age:</p>
            <p>{profile.age || "Not specified"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Class:</p>
            <p>{profile.class || "Not specified"}</p>
          </div>
        </div>
        {profile.exam_prep && (
          <div className="mb-3">
            <p className="text-muted-foreground text-sm">Exam Prep:</p>
            <Badge variant="secondary">{profile.exam_prep}</Badge>
          </div>
        )}
        <div className="mb-3">
          <p className="text-muted-foreground text-sm">Hobbies:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {getHobbies(profile.hobbies).map((hobby) => (
              <Badge key={hobby} variant="outline" className="text-xs">{hobby}</Badge>
            ))}
            {getHobbies(profile.hobbies).length === 0 && (
              <p className="text-sm text-muted-foreground">No hobbies specified</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={handleToggleFollow}
          disabled={isUpdating}
          className={`flex-1 ${isFollowing ? "border-red-500 text-red-500 hover:bg-red-50" : ""}`}
        >
          {isFollowing 
            ? <><UserMinus className="w-4 h-4 mr-1" />{isUpdating ? "Updating..." : "Unspark "}</>
            : <><UserPlus className="w-4 h-4 mr-1" />{isUpdating ? "Updating..." : "Add Spark "}</>
          }
        </Button>
        {showMessageButton && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMessageClick?.(profile)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
