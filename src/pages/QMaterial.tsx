import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { 
  fetchStudyMaterials,
  deleteStudyMaterial,
  StudyMaterial 
} from "@/lib/api/material-api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MaterialCard } from "@/components/material/MaterialCard";
import { MaterialUploadDialog } from "@/components/material/MaterialUploadDialog";

const QMaterial = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showMyUploads, setShowMyUploads] = useState(false);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [materialToDelete, setMaterialToDelete] = useState<StudyMaterial | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching study materials...");
      const materials = await fetchStudyMaterials();
      console.log("Fetched materials:", materials);
      setStudyMaterials(materials);
    } catch (error) {
      console.error("Error loading materials:", error);
      toast.error("Failed to load study materials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadUpdate = (materialId: string, newCount: number) => {
    setStudyMaterials(materials => 
      materials.map(material => 
        material.id === materialId 
          ? { ...material, downloads: newCount }
          : material
      )
    );
  };

  const confirmDelete = (material: StudyMaterial) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    
    try {
      await deleteStudyMaterial(materialToDelete);
      
      // Update local state
      setStudyMaterials(materials => 
        materials.filter(m => m.id !== materialToDelete.id)
      );
      
      toast.success("Material deleted successfully");
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete material");
    }
  };

  const canDeleteMaterial = (material: StudyMaterial) => {
    return user && user.id === material.user_id;
  };

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === "all" ? true : material.subject === selectedSubject;
    const matchesUser = showMyUploads ? material.user_id === user?.id : true;
    
    return matchesSearch && matchesSubject && matchesUser;
  });

  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-blue-500">Q</span>
              <span className="text-white">.Material</span>
            </h1>
            <p className="text-muted-foreground">
              Share and discover study materials from the community
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Upload Material
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-muted/30 p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search study materials..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Literature">Literature</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="myUploads"
                checked={showMyUploads}
                onCheckedChange={() => setShowMyUploads(!showMyUploads)}
                disabled={!user}
              />
              <label
                htmlFor="myUploads"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                My uploads
              </label>
            </div>
          </div>
        </div>

        {/* Materials List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <MaterialCard 
                  key={material.id} 
                  material={material}
                  onDelete={confirmDelete}
                  canDelete={canDeleteMaterial(material)}
                  onDownloadUpdate={handleDownloadUpdate}
                />
              ))
            ) : (
              <div className="col-span-3 flex justify-center items-center h-40 bg-muted/30 rounded-lg">
                <p className="text-center text-muted-foreground">No study materials found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Upload Modal */}
        <MaterialUploadDialog 
          open={uploadModalOpen} 
          onOpenChange={setUploadModalOpen} 
          onUploadSuccess={loadMaterials}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your uploaded material.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setMaterialToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">About Q.Material</h3>
          <p className="text-muted-foreground">
            Q.Material is a community platform for sharing and discovering high-quality study materials.
            You can browse resources without an account, but you'll need to sign up to upload your own materials or 
            manage your uploads. All uploads are reviewed to ensure they meet community guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QMaterial;
