import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/pdf'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

interface ValidationRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileData?: string; // base64 encoded for additional checks
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non autorisé');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Non autorisé');
    }

    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_identifier: `${user.id}:upload`,
      p_endpoint: 'validate-upload',
      p_max_attempts: 10, // 10 uploads per 15 minutes
      p_window_minutes: 15
    });

    if (rateLimitError || !rateLimitOk) {
      return new Response(
        JSON.stringify({ 
          error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { fileName, fileSize, mimeType, fileData }: ValidationRequest = await req.json();

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      await logAuditEvent(supabase, user.id, 'upload_rejected', 'file', null, {
        reason: 'file_too_large',
        size: fileSize,
        fileName
      });

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Fichier trop volumineux. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024}MB` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      await logAuditEvent(supabase, user.id, 'upload_rejected', 'file', null, {
        reason: 'invalid_mime_type',
        mimeType,
        fileName
      });

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, PDF' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file extension
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      await logAuditEvent(supabase, user.id, 'upload_rejected', 'file', null, {
        reason: 'invalid_extension',
        extension,
        fileName
      });

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Extension de fichier non autorisée' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Additional validation: check file signature if fileData is provided
    if (fileData) {
      const isValidSignature = validateFileSignature(fileData, mimeType);
      if (!isValidSignature) {
        await logAuditEvent(supabase, user.id, 'upload_rejected', 'file', null, {
          reason: 'invalid_file_signature',
          mimeType,
          fileName
        });

        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Le contenu du fichier ne correspond pas à son type déclaré' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Log successful validation
    await logAuditEvent(supabase, user.id, 'upload_validated', 'file', null, {
      fileName,
      fileSize,
      mimeType
    });

    return new Response(
      JSON.stringify({ 
        valid: true,
        message: 'Fichier validé avec succès'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in validate-upload function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

// Helper function to validate file signatures (magic numbers)
function validateFileSignature(base64Data: string, mimeType: string): boolean {
  try {
    // Decode first few bytes to check magic numbers
    const binaryString = atob(base64Data.substring(0, 100));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check file signatures
    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        // JPEG: FF D8 FF
        return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
      
      case 'image/png':
        // PNG: 89 50 4E 47
        return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
      
      case 'application/pdf':
        // PDF: 25 50 44 46 (%PDF)
        return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error validating file signature:', error);
    return false;
  }
}

// Helper function to log audit events
async function logAuditEvent(
  supabase: any,
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: any
) {
  try {
    await supabase.rpc('log_audit_event', {
      p_user_id: userId,
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_metadata: metadata
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

serve(handler);
