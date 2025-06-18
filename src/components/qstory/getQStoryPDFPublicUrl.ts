
/**
 * Returns the public URL of a story PDF from its file path.
 */
export function getQStoryPDFPublicUrl(pdfPath: string): string {
  // Use same base as in QStoryPDFViewer
  return `https://fwnngoxzljdkcwkgkyqu.supabase.co/storage/v1/object/public/qstory/${pdfPath}`;
}
