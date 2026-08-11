-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
-- Create enum for receipt source
CREATE TYPE public.receipt_source AS ENUM ('email', 'physical', 'manual');
-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'paused', 'trial');
-- Create enum for bill status
CREATE TYPE public.bill_status AS ENUM ('pending', 'paid', 'overdue');
-- Create enum for alert type
CREATE TYPE public.alert_type AS ENUM ('price_increase', 'price_drop', 'duplicate_charge');
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Bank connections
CREATE TABLE public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  institution_id TEXT,
  access_token TEXT,
  item_id TEXT,
  status TEXT DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bank connections" ON public.bank_connections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_bank_connections_updated_at BEFORE UPDATE ON public.bank_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_connection_id UUID REFERENCES public.bank_connections(id) ON DELETE SET NULL,
  merchant_name TEXT NOT NULL,
  merchant_normalized TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  transaction_date DATE NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_merchant ON public.transactions(user_id, merchant_normalized);
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Receipts
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  source receipt_source NOT NULL,
  merchant_name TEXT,
  amount NUMERIC(12,2),
  receipt_date DATE,
  items JSONB,
  image_url TEXT,
  email_subject TEXT,
  email_from TEXT,
  order_id TEXT,
  raw_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receipts" ON public.receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT DEFAULT 'monthly',
  next_renewal_date DATE,
  status subscription_status DEFAULT 'active',
  category TEXT,
  detected_from TEXT,
  cancellation_url TEXT,
  price_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Return windows
CREATE TABLE public.return_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  merchant_name TEXT NOT NULL,
  item_name TEXT,
  purchase_date DATE NOT NULL,
  return_deadline DATE NOT NULL,
  amount NUMERIC(12,2),
  is_returned BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.return_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own return windows" ON public.return_windows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_return_windows_deadline ON public.return_windows(user_id, return_deadline);
CREATE TRIGGER update_return_windows_updated_at BEFORE UPDATE ON public.return_windows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Warranties
CREATE TABLE public.warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  merchant_name TEXT,
  purchase_date DATE NOT NULL,
  warranty_expiry DATE NOT NULL,
  warranty_type TEXT DEFAULT 'manufacturer',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own warranties" ON public.warranties FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON public.warranties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Bills
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  merchant_name TEXT,
  amount NUMERIC(12,2),
  due_date DATE,
  billing_cycle TEXT DEFAULT 'monthly',
  status bill_status DEFAULT 'pending',
  category TEXT,
  has_late_fee BOOLEAN DEFAULT true,
  late_fee_amount NUMERIC(12,2),
  auto_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bills" ON public.bills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_bills_due_date ON public.bills(user_id, due_date);
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Price alerts
CREATE TABLE public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  alert_type alert_type NOT NULL,
  merchant_name TEXT NOT NULL,
  old_amount NUMERIC(12,2),
  new_amount NUMERIC(12,2),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own price alerts" ON public.price_alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Store policies
CREATE TABLE public.store_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL UNIQUE,
  return_window_days INTEGER,
  return_conditions TEXT,
  warranty_info TEXT,
  refund_method TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store policies are publicly readable" ON public.store_policies FOR SELECT USING (true);
CREATE TRIGGER update_store_policies_updated_at BEFORE UPDATE ON public.store_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Receipt images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('receipt-images', 'receipt-images', false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Users can upload own receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipt-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipt-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own receipts" ON storage.objects FOR DELETE USING (bucket_id = 'receipt-images' AND auth.uid()::text = (storage.foldername(name))[1]);
