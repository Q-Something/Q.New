import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { UserProfile, updateUserProfile } from "@/lib/api/social-api";

interface FormProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

const streamOptions = ["PCM", "PCB", "Commerce", "Humanities"];

const mbtiTypes = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP"
];
const mbtiToGroup: Record<string, string> = {
  INTJ: "analyst", INTP: "analyst", ENTJ: "analyst", ENTP: "analyst",
  INFJ: "diplomat", INFP: "diplomat", ENFJ: "diplomat", ENFP: "diplomat",
  ISTJ: "sentinel", ISFJ: "sentinel", ESTJ: "sentinel", ESFJ: "sentinel",
  ISTP: "explorer", ISFP: "explorer", ESTP: "explorer", ESFP: "explorer"
};
const groupToAvatar: Record<string, string> = {
  analyst: "/assets/analyst.png",
  diplomat: "/assets/diplomat.png",
  sentinel: "/assets/sentinel.png",
  explorer: "/assets/explorer.png"
};
function getAvatarForMBTI(mbti: string): string {
  const group = mbtiToGroup[mbti];
  return groupToAvatar[group] || "/assets/analyst.png";
}

export function ProfileEditForm({ profile, refreshProfile }: FormProps) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name || "",
    uid: profile.uid || "",
    age: profile.age?.toString() || "",
    class: profile.class || "",
    hobbies: profile.hobbies || "",
    exam_prep: profile.exam_prep || "",
    instagram: profile.instagram || "",
    discord: profile.discord || "",
    stream:
      (profile.class === "11th" || profile.class === "12th")
        ? (profile as any).stream || ""
        : "",
    mbti: profile.mbti || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      display_name: profile.display_name || "",
      uid: profile.uid || "",
      age: profile.age?.toString() || "",
      class: profile.class || "",
      hobbies: profile.hobbies || "",
      exam_prep: profile.exam_prep || "",
      instagram: profile.instagram || "",
      discord: profile.discord || "",
      stream:
        (profile.class === "11th" || profile.class === "12th")
          ? (profile as any).stream || ""
          : "",
      mbti: profile.mbti || ""
    });
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let stream: string | null =
        formData.class === "11th" || formData.class === "12th"
          ? formData.stream || null
          : null;
      const updates: Partial<UserProfile> & { stream?: string | null } = {
        display_name: formData.display_name,
        uid: formData.uid,
        age: formData.age ? Number(formData.age) : null,
        class: formData.class || null,
        hobbies: formData.hobbies || null,
        exam_prep: formData.exam_prep || null,
        instagram: formData.instagram || null,
        discord: formData.discord || null,
        mbti: formData.mbti,
        avatar_url: getAvatarForMBTI(formData.mbti)
      };
      if (stream !== null) updates["stream"] = stream;
      await updateUserProfile(updates);
      toast.success("Profile updated successfully!");
      refreshProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error?.message?.includes("duplicate key")) {
        toast.error("This UID is already taken. Please choose a different one.");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        handleSave();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
            placeholder="Your full name"
          />
        </div>
        <div>
          <Label htmlFor="uid">Unique ID (UID)</Label>
          <Input
            id="uid"
            value={formData.uid}
            onChange={(e) => setFormData((prev) => ({ ...prev, uid: e.target.value }))}
            placeholder="john123"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Others can find you using this UID
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
            placeholder="18"
            min="10"
            max="100"
          />
        </div>
        <div>
          <Label htmlFor="class">Class/Course</Label>
          <Select
            value={formData.class}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                class: value,
                stream: (value === "11th" || value === "12th") ? (prev.stream || "PCM") : "",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9th">9th Grade</SelectItem>
              <SelectItem value="10th">10th Grade</SelectItem>
              <SelectItem value="11th">11th Grade</SelectItem>
              <SelectItem value="12th">12th Grade</SelectItem>
              <SelectItem value="cee">CEE</SelectItem>
              <SelectItem value="college">College</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(formData.class === "11th" || formData.class === "12th") && (
        <div>
          <Label htmlFor="stream">Stream</Label>
          <Select
            value={formData.stream || "PCM"}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, stream: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your stream" />
            </SelectTrigger>
            <SelectContent>
              {streamOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Choose your stream for 11th/12th class
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="exam_prep">Exam Preparation (Optional)</Label>
        <Input
          id="exam_prep"
          value={formData.exam_prep}
          onChange={(e) => setFormData((prev) => ({ ...prev, exam_prep: e.target.value }))}
          placeholder="JEE, NEET, SAT, CEE, etc."
        />
      </div>

      <div>
        <Label htmlFor="hobbies">Hobbies</Label>
        <Textarea
          id="hobbies"
          value={formData.hobbies}
          onChange={(e) => setFormData((prev) => ({ ...prev, hobbies: e.target.value }))}
          placeholder="Reading, Gaming, Music, Sports (comma separated)"
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Separate multiple hobbies with commas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instagram">Instagram (Optional)</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
            placeholder="your_username"
          />
        </div>
        <div>
          <Label htmlFor="discord">Discord (Optional)</Label>
          <Input
            id="discord"
            value={formData.discord}
            onChange={(e) => setFormData((prev) => ({ ...prev, discord: e.target.value }))}
            placeholder="username#1234"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="mbti">MBTI Personality Type *</Label>
        <Select
          value={formData.mbti}
          onValueChange={value => setFormData(prev => ({ ...prev, mbti: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your MBTI type" />
          </SelectTrigger>
          <SelectContent>
            {mbtiTypes.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSaving} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
