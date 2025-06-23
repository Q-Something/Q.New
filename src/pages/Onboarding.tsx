import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getCurrentUserProfile, updateUserProfile } from "@/lib/api/social-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const streamOptions = ["PCM", "PCB", "Commerce", "Humanities"];
const classOptions = ["9th", "10th", "11th", "12th", "Other"];
const mbtiTypes = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    display_name: "",
    uid: "",
    age: "",
    class: "",
    stream: "",
    hobbies: "",
    exam_prep: "",
    instagram: "",
    discord: "",
    mbti: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCurrentUserProfile().then((p) => {
      if (!p) {
        toast.error("Could not load profile");
        return;
      }
      setProfile(p);
      setFormData({
        display_name: p.display_name || "",
        uid: p.uid || "",
        age: p.age?.toString() || "",
        class: p.class || "",
        stream: p.stream || "",
        hobbies: p.hobbies || "",
        exam_prep: p.exam_prep || "",
        instagram: p.instagram || "",
        discord: p.discord || "",
        mbti: p.mbti || "",
      });
    });
  }, []);

  const handleSave = async () => {
    // Validate required fields
    if (!formData.display_name || !formData.uid || !formData.class || !formData.hobbies || !formData.age || !formData.mbti) {
      toast.error("Please fill all required fields, including your personality type.");
      return;
    }
    if ((formData.class === "11th" || formData.class === "12th") && !formData.stream) {
      toast.error("Please select your stream");
      return;
    }
    setIsSaving(true);
    try {
      let updates: any = {
        display_name: formData.display_name,
        uid: formData.uid,
        age: Number(formData.age),
        class: formData.class,
        hobbies: formData.hobbies,
        onboarding_complete: true,
        mbti: formData.mbti,
      };
      if (formData.class === "11th" || formData.class === "12th") {
        updates.stream = formData.stream;
      }
      if (formData.exam_prep) updates.exam_prep = formData.exam_prep;
      if (formData.instagram) updates.instagram = formData.instagram;
      if (formData.discord) updates.discord = formData.discord;
      await updateUserProfile(updates);
      toast.success("Profile setup complete!");
      navigate("/");
    } catch (error: any) {
      if (error?.message?.includes("duplicate key")) {
        toast.error("This UID is already taken. Please choose a different one.");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="display_name">Display Name *</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={e => setFormData(f => ({ ...f, display_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="uid">Unique ID (UID) *</Label>
          <Input
            id="uid"
            value={formData.uid}
            onChange={e => setFormData(f => ({ ...f, uid: e.target.value }))}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Others can find you using this UID</p>
        </div>
        <div>
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min="10"
            max="100"
            value={formData.age}
            onChange={e => setFormData(f => ({ ...f, age: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="class">Class *</Label>
          <Select
            value={formData.class}
            onValueChange={value => setFormData(f => ({ ...f, class: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(formData.class === "11th" || formData.class === "12th") && (
          <div>
            <Label htmlFor="stream">Stream *</Label>
            <Select
              value={formData.stream}
              onValueChange={value => setFormData(f => ({ ...f, stream: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your stream" />
              </SelectTrigger>
              <SelectContent>
                {streamOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="hobbies">Hobbies *</Label>
          <Textarea
            id="hobbies"
            value={formData.hobbies}
            onChange={e => setFormData(f => ({ ...f, hobbies: e.target.value }))}
            placeholder="Reading, Gaming, Music, Sports (comma separated)"
            rows={3}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Separate multiple hobbies with commas</p>
        </div>
        <div>
          <Label htmlFor="exam_prep">Exam Preparation (Optional)</Label>
          <Input
            id="exam_prep"
            value={formData.exam_prep}
            onChange={e => setFormData(f => ({ ...f, exam_prep: e.target.value }))}
            placeholder="JEE, NEET, SAT, etc."
          />
        </div>
        <div>
          <Label htmlFor="instagram">Instagram (Optional)</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={e => setFormData(f => ({ ...f, instagram: e.target.value }))}
            placeholder="your_username"
          />
        </div>
        <div>
          <Label htmlFor="discord">Discord (Optional)</Label>
          <Input
            id="discord"
            value={formData.discord}
            onChange={e => setFormData(f => ({ ...f, discord: e.target.value }))}
            placeholder="username#1234"
          />
        </div>
        <div>
          <Label htmlFor="mbti">Personality Type (MBTI) *</Label>
          <Select
            value={formData.mbti}
            onValueChange={value => setFormData(f => ({ ...f, mbti: value }))}
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
          {isSaving ? "Saving..." : "Complete Profile"}
        </Button>
      </form>
    </div>
  );
} 