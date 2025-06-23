
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { formatSparksWithPoints } from "@/utils/sparkDisplay";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/auth-context";

interface QSparkHeaderProps {
  currentProfile: any;
  onProfileClick: () => void;
}

export function QSparkHeader({ currentProfile, onProfileClick }: QSparkHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">
          <span className="text-blue-500">Q</span>
          <span className="text-white">.Spark</span>
        </h1>
        <p className="text-muted-foreground">
          Your social study platform
        </p>
        {currentProfile && (
          <div className="flex gap-4 mt-2 text-sm text-blue-500">
            <span>{formatSparksWithPoints(currentProfile.followers_count)}</span>
            <span>{currentProfile.following_count} sparked</span>
            <span>{currentProfile.mutual_sparks_count} mutual</span>
          </div>
        )}
      </div>
      <Button onClick={onProfileClick}>
        <Settings className="mr-2 h-4 w-4" /> 
        Profile Settings
      </Button>
    </div>
  );
}
