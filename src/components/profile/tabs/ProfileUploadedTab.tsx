
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProfileUploadedStories } from "@/components/qstory/ProfileUploadedStories";

export function ProfileUploadedTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Q.Story Uploads</CardTitle>
        <CardDescription>
          Check the status of your uploaded stories and track likes & bookmarks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4" />
        <ProfileUploadedStories />
      </CardContent>
    </Card>
  );
}
