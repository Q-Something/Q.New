import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type Quote = {
  id: string;
  quote: string;
  is_active: boolean;
};

export const PhantomBabaAdminPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [input, setInput] = useState("");
  const [editMode, setEditMode] = useState(false);

  async function fetchCurrent() {
    setLoading(true);
    const { data, error } = await supabase
      .from("motivational_quotes")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) toast({ description: "Error loading motivational quote." });
    setCurrentQuote(data || null);
    setInput(data?.quote || "");
    setEditMode(false);
    setLoading(false);
  }

  useEffect(() => { fetchCurrent(); }, []);

  async function handleCreateOrUpdate() {
    if (!input || input.trim().length < 4) {
      toast({ description: "Quote must be at least 4 characters." });
      return;
    }
    setLoading(true);
    try {
      // First, deactivate all existing
      await supabase
        .from("motivational_quotes")
        .update({ is_active: false })
        .neq("id", "");

      // Then, insert new one as active
      const { data, error } = await supabase
        .from("motivational_quotes")
        .insert([{ quote: input.trim(), is_active: true }])
        .select("*")
        .maybeSingle();

      if (error) throw error;
      setCurrentQuote(data || null);
      setInput(data?.quote || "");
      toast({ description: "Motivational quote saved and now active!", duration: 2500 });
    } catch (err: any) {
      toast({ description: "Error saving quote: " + err?.message });
    } finally {
      setLoading(false);
      setEditMode(false);
    }
  }

  async function handleDelete() {
    if (!currentQuote) return;
    setLoading(true);
    try {
      await supabase.from("motivational_quotes").delete().eq("id", currentQuote.id);
      setCurrentQuote(null);
      setInput("");
      setEditMode(false);
      toast({ description: "Motivational quote deleted." });
    } catch (err: any) {
      toast({ description: "Error deleting quote: " + err?.message });
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Phantom Baba's Motivational Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* Current Quote */}
          {currentQuote ? (
            <div>
              <div className="font-medium mb-1">Current Active Quote:</div>
              <div className="italic bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 mb-3">
                {currentQuote.quote}
              </div>
              {!editMode && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setEditMode(true)}
                    disabled={loading}
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 italic mb-2">No motivational quote yet.</div>
          )}

          {/* Form for new or edit */}
          {(editMode || !currentQuote) && (
            <div className="space-y-2">
              <label htmlFor="baba-quote-inp" className="block font-medium">
                {currentQuote ? "Edit Quote" : "New Motivational Quote"}
              </label>
              <textarea
                id="baba-quote-inp"
                className="w-full resize-none border rounded px-3 py-2"
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                maxLength={180}
                placeholder="Type your motivational message..."
              />
              <Button
                onClick={handleCreateOrUpdate}
                disabled={loading || input.trim().length < 4}
                className="w-full"
              >
                {loading
                  ? (currentQuote ? "Saving..." : "Creating...")
                  : (currentQuote ? "Save" : "Create and Set Active")}
              </Button>
              {editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => {
                    setEditMode(false);
                    setInput(currentQuote?.quote ?? "");
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
