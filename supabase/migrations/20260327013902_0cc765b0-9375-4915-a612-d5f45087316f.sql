CREATE TABLE public.gmail_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expiry timestamp with time zone,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gmail tokens" ON public.gmail_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_gmail_tokens_updated_at
  BEFORE UPDATE ON public.gmail_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
