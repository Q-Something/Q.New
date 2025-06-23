
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QStoryPDFViewer } from "@/components/qstory/QStoryPDFViewer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface QStoryAdminRow {
  id: string;
  title: string;
  description?: string;
  pdf_file: string;
  upload_date: string;
  uploader_id: string;
  status: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected"
};

const statusColor: Record<string, string> = {
  pending: "text-yellow-600",
  approved: "text-green-600",
  rejected: "text-red-600"
};

export const AdminStoryReview: React.FC = () => {
  const [stories, setStories] = useState<QStoryAdminRow[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [viewStory, setViewStory] = useState<QStoryAdminRow | null>(null);

  const fetchStories = async () => {
    setIsLoading(true);
    const query = supabase.from("qstories").select("*").order("upload_date", { ascending: false });
    let { data, error } = await query;
    if (error) {
      toast.error("Failed to fetch stories");
      setIsLoading(false);
      return;
    }
    let filtered = data;
    if (filter !== "all") {
      filtered = filtered.filter((s: QStoryAdminRow) => s.status === filter);
    }
    setStories(filtered);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line
  }, [filter]);

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    setIsLoading(true);
    const { error } = await supabase.from("qstories").update({ status }).eq("id", id);
    if (error) {
      toast.error(`Failed to ${status}: ${error.message}`);
    } else {
      toast.success(`Story ${status === "approved" ? "approved" : "rejected"}!`);
      fetchStories();
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Q.Story Submissions Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {(["pending", "approved", "rejected", "all"] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "secondary"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : statusLabels[f]}
            </Button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : stories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No stories found.
                  </TableCell>
                </TableRow>
              ) : (
                stories.map(story => (
                  <TableRow key={story.id}>
                    <TableCell>
                      <button
                        className="font-semibold text-blue-600 underline"
                        onClick={() => setViewStory(story)}
                        title="View PDF"
                      >
                        {story.title}
                      </button>
                    </TableCell>
                    <TableCell className="min-w-[12rem] max-w-[18rem] truncate">{story.description || <span className="italic opacity-50">No description</span>}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${statusColor[story.status]}`}>
                        {statusLabels[story.status] || story.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(story.upload_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {story.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setViewStory(story)}
                            >
                              View PDF
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={isLoading}
                              onClick={() => handleStatusChange(story.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={isLoading}
                              onClick={() => handleStatusChange(story.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {(story.status === "approved" || story.status === "rejected") && (
                          <Button size="sm" variant="outline" onClick={() => setViewStory(story)}>View PDF</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {viewStory && (
          <QStoryPDFViewer
            pdfPath={viewStory.pdf_file}
            onClose={() => setViewStory(null)}
            title={viewStory.title}
          />
        )}
      </CardContent>
    </Card>
  );
};
