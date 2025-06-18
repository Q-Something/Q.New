
import React, { useState } from "react";

const classOptions = Array.from({ length: 12 }, (_, i) => (i + 1));
const streamOptions = ["PCM", "PCB", "Commerce", "Humanities"];

interface ProfileClassStreamDialogProps {
  onSave: (grade: number, stream?: string) => void;
  currentGrade?: number;
  currentStream?: string | null;
}

const ProfileClassStreamDialog: React.FC<ProfileClassStreamDialogProps> = ({
  onSave, currentGrade, currentStream
}) => {
  const [grade, setGrade] = useState<number>(currentGrade || 6);
  const [stream, setStream] = useState<string | null>(currentStream || null);

  React.useEffect(() => {
    if (grade < 11) setStream(null);
    if (grade >= 11 && !stream) setStream("PCM");
  }, [grade]);

  const handleSave = () => {
    onSave(grade, stream || undefined);
  };

  return (
    <div className="p-4">
      <label className="block mb-2 font-semibold">Class:</label>
      <select value={grade} onChange={e => setGrade(Number(e.target.value))} className="border rounded px-2 py-1 mb-4 w-full">
        {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      {grade >= 11 && (
        <>
          <label className="block mb-2 font-semibold">Stream:</label>
          <select value={stream || ""} onChange={e => setStream(e.target.value)} className="border rounded px-2 py-1 mb-4 w-full">
            {streamOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}
      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full" onClick={handleSave}>
        Save
      </button>
    </div>
  );
};

export default ProfileClassStreamDialog;
