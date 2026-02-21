import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle, Shield, Sparkles, Brain, Loader2, ArrowRight, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { visionAI } from "@/lib/visionAI";
import { useCart } from "@/contexts/CartContext";

interface PrescriptionUploadProps {
  onUpload?: (file: File) => void;
}

const PrescriptionUpload = ({ onUpload }: PrescriptionUploadProps) => {
  const { addToCart } = useCart();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  /* AI Analysis State */
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      confidence: number;
    }>;
    confidence?: number;
  } | null>(null);

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

      // Trigger real analysis
      setAnalyzing(true);
      const result = await visionAI.analyzePrescription(fileData);

      setAnalysisResult({
        medications: result.medications,
        confidence: Math.round(result.medications.reduce((acc, m) => acc + (m.confidence || 0.8), 0) / (result.medications.length || 1) * 100)
      });

      toast.success(`${result.medications.length} médicaments détectés par l'IA`);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Impossible de traiter le fichier");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleAddToCart = () => {
    if (!analysisResult) return;

    analysisResult.medications.forEach(med => {
      addToCart({
        medicine: {
          id: `ocr-${med.name}-${Date.now()}`,
          name: med.name,
          description: `Détecté par scan: ${med.dosage || 'Dosage à confirmer'}`,
          category: 'Scanner',
          requires_prescription: true,
          manufacturer: 'Analyse IA',
          generic_name: med.name,
          dosage: med.dosage || 'À préciser',
          form: 'Comprimé',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        quantity: 1,
        pharmacy_id: 'auto-select',
        pharmacy_name: 'Pharmacie la plus proche',
        price: 2500 // Simulated price
      });
    });

    toast.success(`${analysisResult.medications.length} médicaments ajoutés au panier`);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null);
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
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center gap-3 animate-pulse">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <span className="text-sm font-black uppercase tracking-widest text-blue-700">Analyse Neurone en cours...</span>
              </div>
            ) : analysisResult ? (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-[2rem] border border-blue-100 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-tighter text-purple-900 leading-none">Analyse Intelligente</h4>
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Vision AI v4.0</p>
                  </div>
                  <div className="ml-auto text-[10px] bg-green-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-[0.1em] shadow-md">
                    {analysisResult.confidence}% Confiance
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {analysisResult.medications.map((med, idx) => (
                    <div key={idx} className="bg-white/80 p-3 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between group hover:border-purple-300 transition-all">
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{med.name}</p>
                        <p className="text-[10px] font-medium text-slate-500">{med.dosage} • {med.frequency}</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleRemove}
                    className="rounded-xl border-2 border-slate-200 font-bold h-12"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest h-12 shadow-lg shadow-purple-200 group"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Panier
                  </Button>
                </div>
              </div>
            ) : null}

          </div>
        )}
      </CardContent>
    </Card >
  );
};

export default PrescriptionUpload;
