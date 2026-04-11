-- Create audit logs table for compliance
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create consent logs table for RGPD compliance
CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  consent_type text NOT NULL,
  consent_given boolean NOT NULL DEFAULT false,
  ip_address inet,
  consent_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create rate limiting table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, endpoint)
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs (admins only)
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (false); -- Will be updated when admin role system is implemented

-- RLS Policies for user_consents
CREATE POLICY "Users can view their own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage consents"
  ON public.user_consents FOR ALL
  USING (true);

-- RLS Policies for rate_limits (service role only)
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits FOR ALL
  USING (true);

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_endpoint text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_attempts integer;
  v_window_start timestamp with time zone;
BEGIN
  -- Get current rate limit record
  SELECT attempts, window_start INTO v_current_attempts, v_window_start
  FROM public.rate_limits
  WHERE identifier = p_identifier AND endpoint = p_endpoint;
  
  -- If no record exists or window expired, create/reset
  IF NOT FOUND OR (now() - v_window_start) > (p_window_minutes || ' minutes')::interval THEN
    INSERT INTO public.rate_limits (identifier, endpoint, attempts, window_start)
    VALUES (p_identifier, p_endpoint, 1, now())
    ON CONFLICT (identifier, endpoint) 
    DO UPDATE SET attempts = 1, window_start = now();
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF v_current_attempts >= p_max_attempts THEN
    RETURN false;
  END IF;
  
  -- Increment attempts
  UPDATE public.rate_limits
  SET attempts = attempts + 1
  WHERE identifier = p_identifier AND endpoint = p_endpoint;
  
  RETURN true;
END;
$$;

-- Trigger to update updated_at on user_consents
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add encrypted_data column to prescriptions for sensitive data
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS encrypted_data text,
ADD COLUMN IF NOT EXISTS file_hash text;

-- Create index for audit logs queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_rate_limits_identifier_endpoint ON public.rate_limits(identifier, endpoint);