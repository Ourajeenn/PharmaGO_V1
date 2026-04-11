import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/core/Header';
import Footer from '@/components/core/Footer';
import { useECarnet } from '@/contexts/ECarnetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Download, Trash2, Upload, File, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { DocumentType } from '@/types/ecarnet';

const DocumentManager = () => {
    const navigate = useNavigate();
    const {
        currentPatient,
        getPatientDocuments,
        addDocument,
        deleteDocument
    } = useECarnet();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        documentType: 'Autre' as DocumentType,
        description: '',
        documentDate: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    if (!currentPatient) {
        navigate('/ecarnet');
        return null;
    }

    const documents = getPatientDocuments(currentPatient.id);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error('Veuillez sélectionner un fichier');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;

            addDocument({
                patientId: currentPatient.id,
                title: formData.title,
                documentType: formData.documentType,
                description: formData.description,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                fileSize: selectedFile.size,
                fileData: base64String,
                uploadDate: new Date().toISOString(),
                documentDate: formData.documentDate,
                isConfidential: false,
            });

            toast.success('Document ajouté avec succès');
            setIsDialogOpen(false);
            setFormData({
                title: '',
                documentType: 'Autre',
                description: '',
                documentDate: '',
            });
            setSelectedFile(null);
        };

        reader.readAsDataURL(selectedFile);
    };

    const handleDownload = (doc: any) => {
        const link = document.createElement('a');
        link.href = doc.fileData;
        link.download = doc.fileName;
        link.click();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            deleteDocument(id);
            toast.success('Document supprimé');
        }
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-600" />;
        if (fileType.includes('image')) return <File className="h-8 w-8 text-blue-600" />;
        return <File className="h-8 w-8 text-gray-600" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/ecarnet')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au E-Carnet
                    </Button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold">Gestion des documents</h1>
                                <p className="text-muted-foreground">
                                    Gérez les documents médicaux
                                </p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Ajouter un document
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Ajouter un document</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label>Fichier *</Label>
                                        <div className="mt-2">
                                            <Input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                required
                                            />
                                            {selectedFile && (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Titre *</Label>
                                            <Input
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Ex: Analyse de sang"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Type de document</Label>
                                            <Select
                                                value={formData.documentType}
                                                onValueChange={(value: DocumentType) =>
                                                    setFormData(prev => ({ ...prev, documentType: value }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Ordonnance">Ordonnance</SelectItem>
                                                    <SelectItem value="Radio">Radio</SelectItem>
                                                    <SelectItem value="Bilan">Bilan</SelectItem>
                                                    <SelectItem value="Analyse">Analyse</SelectItem>
                                                    <SelectItem value="Certificat">Certificat</SelectItem>
                                                    <SelectItem value="Autre">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Date du document</Label>
                                        <Input
                                            type="date"
                                            value={formData.documentDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, documentDate: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            placeholder="Notes ou description du document..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button type="submit">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Téléverser
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Total</p>
                                <p className="text-3xl font-bold">{documents.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    {['Ordonnance', 'Radio', 'Analyse'].map(type => (
                        <Card key={type}>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">{type}s</p>
                                    <p className="text-3xl font-bold">
                                        {documents.filter(d => d.documentType === type).length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tous les documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {documents.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-2">Aucun document</h3>
                                <p className="text-muted-foreground mb-4">
                                    Commencez à téléverser vos documents médicaux
                                </p>
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter le premier document
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {documents.map((doc) => (
                                    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                {getFileIcon(doc.fileType)}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold truncate">{doc.title}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(doc.uploadDate), 'dd MMM yyyy', { locale: fr })}
                                                    </p>
                                                </div>
                                            </div>

                                            <Badge variant="outline" className="mb-3">
                                                {doc.documentType}
                                            </Badge>

                                            {doc.description && (
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                    {doc.description}
                                                </p>
                                            )}

                                            <div className="text-xs text-muted-foreground mb-3">
                                                {formatFileSize(doc.fileSize)}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleDownload(doc)}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Télécharger
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
};

export default DocumentManager;
