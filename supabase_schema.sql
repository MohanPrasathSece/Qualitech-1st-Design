-- ==============================================================================
-- QUALITECH CONNECTORICS E-COMMERCE & STORAGE BACKEND
-- PostgreSQL & Supabase Database Migration Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL CHECK (brand IN ('Amphenol', 'Zolex', 'Qualitech')),
  category TEXT NOT NULL,
  sub_category TEXT,
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  industries JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  image TEXT,
  in_stock BOOLEAN DEFAULT true,
  external_url TEXT,
  is_enquiry BOOLEAN DEFAULT false,
  price NUMERIC(12, 2) DEFAULT 0.00,
  sale_price NUMERIC(12, 2),
  stock_count INTEGER DEFAULT 100,
  low_stock_threshold INTEGER DEFAULT 20,
  min_order_qty INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'pcs',
  rating NUMERIC(3, 2) DEFAULT 4.9,
  review_count INTEGER DEFAULT 0,
  lead_time TEXT DEFAULT '24-48 Hours',
  tiered_pricing JSONB DEFAULT '[]'::jsonb,
  datasheet_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast searching & filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- ------------------------------------------------------------------------------
-- 2. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer JSONB NOT NULL,
  shipping_method JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Paid',
  order_status TEXT NOT NULL DEFAULT 'Confirmed',
  subtotal NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(12, 2) DEFAULT 0.00,
  coupon_code TEXT,
  tax NUMERIC(12, 2) NOT NULL,
  shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(12, 2) NOT NULL,
  tracking_number TEXT,
  estimated_delivery TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. ORDER ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  custom_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_number ON public.order_items(order_number);

-- ------------------------------------------------------------------------------
-- 4. QUOTE & CUSTOM CABLE RFQ REQUESTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  gstin TEXT,
  product_category TEXT NOT NULL,
  pin_count TEXT,
  wire_gauge TEXT,
  connector_type TEXT,
  estimated_qty INTEGER DEFAULT 100,
  target_delivery_date TEXT,
  technical_specs TEXT,
  drawing_attachment_url TEXT,
  status TEXT DEFAULT 'New Enquiry' CHECK (status IN ('New Enquiry', 'Reviewing', 'Quote Sent', 'Converted', 'Closed')),
  quoted_amount NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON public.quote_requests(email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests(status);

-- ------------------------------------------------------------------------------
-- 5. COUPONS & DISCOUNTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'free_shipping')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_spend NUMERIC(12, 2) DEFAULT 0.00,
  max_discount NUMERIC(12, 2),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Promotional Coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_spend, max_discount, is_active)
VALUES
  ('FIRST10', '10% discount on first industrial order above ₹3,000', 'percent', 10, 3000, 2500, true),
  ('BULK500', 'Flat ₹500 discount for OEM orders above ₹10,000', 'fixed', 500, 10000, 500, true),
  ('FREESHIP', 'Free standard shipping on orders above ₹2,500', 'free_shipping', 0, 2500, 0, true)
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. SUPABASE STORAGE BUCKETS
-- ------------------------------------------------------------------------------
-- Product Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- CAD Drawings & Technical Attachments Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-drawings', 'cad-drawings', true)
ON CONFLICT (id) DO NOTHING;

-- Invoices & Order Receipts Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read, authenticated or anon can read
CREATE POLICY "Public Read Products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admin All Products" ON public.products
  FOR ALL USING (true);

-- Orders: Anyone can insert their order, users can read their orders
CREATE POLICY "Public Insert Orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Orders" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Admin All Orders" ON public.orders
  FOR ALL USING (true);

-- Order Items
CREATE POLICY "Public Insert Order Items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Order Items" ON public.order_items
  FOR SELECT USING (true);

-- Quote Requests
CREATE POLICY "Public Insert Quote Requests" ON public.quote_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Quote Requests" ON public.quote_requests
  FOR SELECT USING (true);

-- Coupons
CREATE POLICY "Public Read Active Coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

-- Storage Policies: Public read for product images & cad drawings
CREATE POLICY "Public Read Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public Upload Product Images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public Read CAD Drawings" ON storage.objects
  FOR SELECT USING (bucket_id = 'cad-drawings');

CREATE POLICY "Public Upload CAD Drawings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cad-drawings');

-- ------------------------------------------------------------------------------
-- 8. AUTO-UPDATE TIMESTAMPS TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
