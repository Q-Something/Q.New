
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProfileBookmarkedStories } from "@/components/qstory/ProfileBookmarkedStories";

export function ProfileBookmarkedTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookmarked Q.Stories</CardTitle>
        <CardDescription>
          Your favorite/saved stories for later reading.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileBookmarkedStories />
      </CardContent>
    </Card>
  );
}
