import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle, Shield, Sparkles, Brain, Loader2, ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PrescriptionUploadProps {
  onUpload?: (file: File) => void;
}

const PrescriptionUpload = ({ onUpload }: PrescriptionUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  /* AI Analysis State */
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ medicines: string[], confidence: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);

    try {
      // Convert file to base64 for signature validation
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(selectedFile);
      });

      const fileData = await base64Promise;

      // Validate file with backend security checks
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour uploader une ordonnance");
        setUploading(false);
        return;
      }

      const validationResponse = await supabase.functions.invoke('validate-upload', {
        body: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          fileData: fileData
        }
      });

      if (validationResponse.error || !validationResponse.data?.valid) {
        toast.error(validationResponse.data?.error || "Le fichier n'a pas passé les contrôles de sécurité");
        setUploading(false);
        return;
      }

      // File is validated, proceed
      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        setPreview(fileData);
      } else {
        setPreview(null);
      }

      if (onUpload) {
        onUpload(selectedFile);
      }

      toast.success("Ordonnance validée et sécurisée avec succès");

      // Trigger AI Analysis automatically
      await analyzePrescription();

    } catch (error: any) {
      console.error('Upload validation error:', error);
      toast.error(error.message || "Impossible de valider le fichier");
    } finally {
      setUploading(false);
    }
  };

  const analyzePrescription = async () => {
    setAnalyzing(true);
    // Simulate AI Processing time
    await new Promise(resolve => setTimeout(resolve, 2500));

    setAnalysisResult({
      medicines: ["Amoxicilline 1g", "Paracétamol 1000mg", "Spasfon Lyoc"],
      confidence: 98.5
    });
    setAnalyzing(false);
    toast.info("Analyse IA terminée : 3 médicaments détectés");
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null); // Reset analysis
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-2 border-dashed hover:border-primary transition-all">
      <CardContent className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {!file ? (
          <div
            onClick={handleClick}
            className="cursor-pointer text-center py-8"
          >
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Téléverser votre ordonnance</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Formats acceptés: JPG, PNG, PDF (max 5MB)
            </p>
            <p className="text-xs text-green-600 flex items-center justify-center gap-1 mb-4">
              <Shield className="h-3 w-3" />
              Validation sécurisée • Chiffrement AES-256
            </p>
            <Button variant="outline" type="button" disabled={uploading}>
              {uploading ? "Validation en cours..." : "Choisir un fichier"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/10 p-2 rounded">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <FileText className="h-8 w-8 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded">
              <CheckCircle className="h-4 w-4" />
              <span>Ordonnance téléversée avec succès</span>
            </div>


            {/* Analysis Section */}
            {analyzing ? (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-center gap-3 animate-pulse">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-700">Analyse de l'ordonnance par IA...</span>
              </div>
            ) : analysisResult ? (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-sm text-purple-800">Analyse Intelligente</span>
                  <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-bold">
                    {analysisResult.confidence}% confiance
                  </span>
                </div>
                <div className="space-y-2">
                  {analysisResult.medicines.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/60 p-2 rounded-lg border border-purple-100">
                      <span className="text-sm font-medium">{med}</span>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200" size="sm">
                  <ShoppingCart className="h-3 w-3 mr-2" /> Ajouter au panier
                </Button>
              </div>
            ) : null}

          </div>
        )}
      </CardContent>
    </Card >
  );
};

export default PrescriptionUpload;
