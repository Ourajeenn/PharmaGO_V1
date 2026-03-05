-- Création du bucket de stockage pour les pièces jointes des messages
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message_attachments', 'message_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Configuration de RLS (Row Level Security) pour le bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Politique d'accès public en lecture
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'message_attachments' );

-- Politique d'accès pour les utilisateurs authentifiés en insertion
-- Tout utilisateur authentifié peut télécharger un fichier
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'message_attachments' AND auth.uid() = owner );

-- Politique d'accès pour supprimer ses propres fichiers
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'message_attachments' AND auth.uid() = owner );
