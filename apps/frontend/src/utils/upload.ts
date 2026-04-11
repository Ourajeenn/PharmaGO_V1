import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Uploads a profile image to Supabase Storage and returns the public URL.
 * @param file The file to upload.
 * @param bucket The storage bucket name (default: 'avatars').
 * @returns The public URL of the uploaded image, or null if upload fails.
 */
export const uploadProfileImage = async (file: File, bucket: string = 'avatars'): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            // If the bucket doesn't exist or RLS fails, we might get an error here.
            // We'll log it but return null so registration can proceed without the image.
            toast.error("Erreur lors de l'upload de l'image. L'inscription continuera sans photo.");
            return null;
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Unexpected error during image upload:', error);
        return null;
    }
};
