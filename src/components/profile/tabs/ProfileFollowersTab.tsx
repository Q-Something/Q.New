import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import type { UserProfile } from "@/lib/api/social-api";

export function ProfileFollowersTab({ followers }: { followers: UserProfile[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Followers</CardTitle>
        <CardDescription>Students who have sparked with you</CardDescription>
      </CardHeader>
      <CardContent>
        {followers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {followers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <Avatar>
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} />
                  ) : (
                    <span className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-lg font-bold">
                      {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {user.display_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    @{user.uid}
                  </p>
                </div>
                <Badge variant="secondary">
                  <Heart className="w-3 h-3 mr-1" />
                  Follower
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No followers yet. Keep engaging with the community!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
