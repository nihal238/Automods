-- =====================================================
-- AutoMods Complete Migration Export
-- Run this in your new Supabase project's SQL Editor
-- =====================================================

-- ========== STEP 1: ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'customer', 'seller');
CREATE TYPE public.order_status_phase AS ENUM (
  'order_placed', 'payment_pending', 'payment_confirmed', 'order_confirmed',
  'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery',
  'delivered', 'cancelled', 'returned', 'refunded'
);

-- ========== STEP 2: TABLES (before functions that reference them) ==========

CREATE TABLE public.car_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.car_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.car_brands(id),
  name text NOT NULL,
  year_start integer,
  year_end integer,
  image_url text,
  model_3d_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  phone text,
  avatar_url text,
  is_blocked boolean DEFAULT false,
  seller_approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'customer'
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  brand text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL,
  original_price integer,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  compatibility text[] DEFAULT '{}',
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  shipping_address text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  product_id uuid REFERENCES public.products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL,
  price integer NOT NULL,
  seller_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  status order_status_phase NOT NULL,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.saved_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  car_model_id uuid NOT NULL REFERENCES public.car_models(id),
  name text NOT NULL DEFAULT 'My Design',
  color text NOT NULL,
  modifications jsonb DEFAULT '{}'::jsonb,
  total_cost integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  base_price integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ========== STEP 3: FUNCTIONS (after tables exist) ==========
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_seller_approved(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT seller_approved FROM public.profiles WHERE user_id = _user_id), false)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, COALESCE((new.raw_user_meta_data ->> 'role')::app_role, 'customer'));
  RETURN new;
END;
$$;

-- ========== STEP 4: RLS POLICIES ==========

ALTER TABLE public.car_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view car brands" ON public.car_brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage car brands" ON public.car_brands FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view car models" ON public.car_models FOR SELECT USING (true);
CREATE POLICY "Admins can manage car models" ON public.car_models FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Approved sellers can manage their own products" ON public.products FOR ALL USING ((auth.uid() = seller_id) AND has_role(auth.uid(), 'seller') AND is_seller_approved(auth.uid())) WITH CHECK ((auth.uid() = seller_id) AND has_role(auth.uid(), 'seller') AND is_seller_approved(auth.uid()));

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create order items for their orders" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE USING (has_role(auth.uid(), 'admin'));

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their order status history" ON public.order_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can view all order status history" ON public.order_status_history FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert order status history" ON public.order_status_history FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update order status history" ON public.order_status_history FOR UPDATE USING (has_role(auth.uid(), 'admin'));

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own wishlist" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own wishlist" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own designs" ON public.saved_designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own designs" ON public.saved_designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own designs" ON public.saved_designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own designs" ON public.saved_designs FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ========== STEP 5: TRIGGER ==========
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== STEP 6: STORAGE BUCKETS ==========
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('car-model-images', 'car-model-images', true);

CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth users upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Public read car model images" ON storage.objects FOR SELECT USING (bucket_id = 'car-model-images');
CREATE POLICY "Auth users upload car model images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-model-images' AND auth.role() = 'authenticated');

-- ========== STEP 7: DATA INSERTS ==========

-- car_brands
INSERT INTO public.car_brands (id, name, logo_code, created_at) VALUES
  ('110ac39c-a37c-48d9-a58a-eeb2625bd60a', 'Maruti Suzuki', 'MS', '2025-12-25 06:39:21.378099+00'),
  ('3eaa4758-0a25-450a-9abc-e7069035af27', 'Hyundai', 'HY', '2025-12-25 06:39:21.378099+00'),
  ('dda983ca-cac0-4e21-990d-20959625c809', 'Tata Motors', 'TM', '2025-12-25 06:39:21.378099+00'),
  ('4133312f-7e6d-42e7-95cf-fb39c65d5f55', 'Mahindra', 'MH', '2025-12-25 06:39:21.378099+00'),
  ('32f5d6d3-c2ae-402d-a3d1-398106df9203', 'Honda', 'HN', '2025-12-25 06:39:21.378099+00'),
  ('45626255-680d-4941-82cc-5dbaad0b8f65', 'Toyota', 'TY', '2025-12-25 06:39:21.378099+00'),
  ('e5268c6a-561f-4715-8175-f05a67069d11', 'Volkswagen', 'VW', '2025-12-25 06:39:21.378099+00'),
  ('a43274a3-fb65-42d0-9416-76dedcdf6eaf', 'Kia', 'KI', '2025-12-25 06:39:21.378099+00');

-- car_models
INSERT INTO public.car_models (id, brand_id, name, year_start, year_end, image_url, created_at) VALUES
  ('62948de3-71aa-40e1-b3a6-e8043a6d4bbd', '110ac39c-a37c-48d9-a58a-eeb2625bd60a', 'Swift', 2018, 2024, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400', '2025-12-25 06:39:21.378099+00'),
  ('377e53d8-05f7-4c09-a349-c12a307d1de8', '110ac39c-a37c-48d9-a58a-eeb2625bd60a', 'Baleno', 2019, 2024, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400', '2025-12-25 06:39:21.378099+00'),
  ('327a40f6-1314-4bac-b442-11c1dc7ec555', '110ac39c-a37c-48d9-a58a-eeb2625bd60a', 'Brezza', 2020, 2024, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400', '2025-12-25 06:39:21.378099+00'),
  ('288009d2-b5f4-40f5-b762-be9f55e89b8b', '110ac39c-a37c-48d9-a58a-eeb2625bd60a', 'Ertiga', 2018, 2024, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', '2025-12-25 06:39:21.378099+00'),
  ('c175ce7f-d89f-41c9-93dc-0d7ccbc05f5d', '3eaa4758-0a25-450a-9abc-e7069035af27', 'i20', 2020, 2024, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400', '2025-12-25 06:39:21.378099+00'),
  ('fba4564c-d943-4528-a2fa-771a6ff77076', '3eaa4758-0a25-450a-9abc-e7069035af27', 'Creta', 2020, 2024, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400', '2025-12-25 06:39:21.378099+00'),
  ('01a4284b-06fd-426b-8f89-45432de1c546', '3eaa4758-0a25-450a-9abc-e7069035af27', 'Venue', 2019, 2024, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400', '2025-12-25 06:39:21.378099+00'),
  ('e1c906e9-9ef7-4ebc-bf1c-3dfc96578b96', '3eaa4758-0a25-450a-9abc-e7069035af27', 'Verna', 2020, 2024, 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400', '2025-12-25 06:39:21.378099+00'),
  ('fa757adc-643b-4164-a334-94c0571e758d', 'dda983ca-cac0-4e21-990d-20959625c809', 'Nexon', 2020, 2024, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400', '2025-12-25 06:39:21.378099+00'),
  ('cfd16e43-2b83-420c-94a6-9d1c89bd28b6', 'dda983ca-cac0-4e21-990d-20959625c809', 'Harrier', 2019, 2024, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', '2025-12-25 06:39:21.378099+00'),
  ('76c65000-2d3a-47ee-8d15-97f59f9e0303', 'dda983ca-cac0-4e21-990d-20959625c809', 'Punch', 2021, 2024, 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=400', '2025-12-25 06:39:21.378099+00'),
  ('67c77d85-fe92-4382-9d1f-ea039440b770', 'dda983ca-cac0-4e21-990d-20959625c809', 'Safari', 2021, 2024, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400', '2025-12-25 06:39:21.378099+00'),
  ('2f3967e5-9ff3-4454-a32b-9d62b533f10c', '4133312f-7e6d-42e7-95cf-fb39c65d5f55', 'Thar', 2020, 2024, 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400', '2025-12-25 06:39:21.378099+00'),
  ('7c81f938-02a2-4b21-a836-2dcb8c83f11c', '4133312f-7e6d-42e7-95cf-fb39c65d5f55', 'XUV700', 2021, 2024, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400', '2025-12-25 06:39:21.378099+00'),
  ('5abb89ed-f4c5-43ff-b036-4971d27539a1', '4133312f-7e6d-42e7-95cf-fb39c65d5f55', 'Scorpio-N', 2022, 2024, 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=400', '2025-12-25 06:39:21.378099+00'),
  ('0bce55d5-b665-4dd8-ad98-92cd91b6bfbe', '4133312f-7e6d-42e7-95cf-fb39c65d5f55', 'XUV300', 2019, 2024, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400', '2025-12-25 06:39:21.378099+00'),
  ('38d7ca53-0305-461e-a8f1-25c8f7ab7a06', '32f5d6d3-c2ae-402d-a3d1-398106df9203', 'City', 2020, 2024, 'https://images.unsplash.com/photo-1619976215249-0a22495f2776?w=400', '2025-12-25 06:39:21.378099+00'),
  ('d251276d-d220-424c-8e32-e12d45346f5a', '32f5d6d3-c2ae-402d-a3d1-398106df9203', 'Amaze', 2018, 2024, 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400', '2025-12-25 06:39:21.378099+00'),
  ('a1369bcc-5bf8-434a-b065-89ba9a7b3c73', '32f5d6d3-c2ae-402d-a3d1-398106df9203', 'Elevate', 2023, 2024, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400', '2025-12-25 06:39:21.378099+00'),
  ('bc0c7033-149c-4ccf-8d2a-49da08961737', '45626255-680d-4941-82cc-5dbaad0b8f65', 'Fortuner', 2020, 2024, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400', '2025-12-25 06:39:21.378099+00'),
  ('238bd80b-bf5b-4273-b099-d0d3bd55b5b5', '45626255-680d-4941-82cc-5dbaad0b8f65', 'Innova Crysta', 2019, 2024, 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400', '2025-12-25 06:39:21.378099+00'),
  ('3ec266bc-8a03-4d1c-af6a-7f2f39ed9183', '45626255-680d-4941-82cc-5dbaad0b8f65', 'Glanza', 2019, 2024, 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=400', '2025-12-25 06:39:21.378099+00'),
  ('39f383ae-7eb6-459b-b595-eec1de8a7165', 'e5268c6a-561f-4715-8175-f05a67069d11', 'Polo', 2018, 2023, 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=400', '2025-12-25 06:39:21.378099+00'),
  ('f7c4eb5b-2a08-4c86-9740-c3f3fa19a2ed', 'e5268c6a-561f-4715-8175-f05a67069d11', 'Virtus', 2022, 2024, 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400', '2025-12-25 06:39:21.378099+00'),
  ('4a1ae568-5f39-498f-976e-ee5ead81c918', 'a43274a3-fb65-42d0-9416-76dedcdf6eaf', 'Seltos', 2019, 2024, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400', '2025-12-25 06:39:21.378099+00'),
  ('d5311c88-f105-4517-89a3-efb8c2fd490d', 'a43274a3-fb65-42d0-9416-76dedcdf6eaf', 'Sonet', 2020, 2024, 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400', '2025-12-25 06:39:21.378099+00');

-- services
INSERT INTO public.services (id, name, description, category, base_price, created_at) VALUES
  ('24519035-16db-40cb-bd1a-5babb76550d9', 'Body Kit Installation', 'Complete sport body kit with front bumper, side skirts, and rear diffuser', 'Exterior', 45000, '2025-12-25 06:39:21.378099+00'),
  ('91fc3603-8207-4bb2-9ab4-cfe86c029110', 'Full Car Wrap', 'Premium vinyl wrap in any color or design', 'Exterior', 35000, '2025-12-25 06:39:21.378099+00'),
  ('1b7fce6c-8dc8-4564-af2f-c8342ca10bba', 'Alloy Wheels Upgrade', 'Upgrade to premium alloy wheels with tyres', 'Wheels', 28000, '2025-12-25 06:39:21.378099+00'),
  ('8447e580-c2ab-4e65-bbea-773674cfeb76', 'Performance Exhaust', 'Free-flow exhaust system for better sound and performance', 'Performance', 18000, '2025-12-25 06:39:21.378099+00'),
  ('171e9fb0-b2a5-49c4-850b-4db6edc9b0d9', 'Lowering Kit', 'Sport suspension lowering springs', 'Performance', 22000, '2025-12-25 06:39:21.378099+00'),
  ('54d8419c-dc5a-4455-85c9-ad5bd5e21724', 'Premium Interior Upholstery', 'Full leather or custom fabric seat covers', 'Interior', 32000, '2025-12-25 06:39:21.378099+00'),
  ('da9fa316-f2a1-4e7d-9c9f-a50e1c0b4901', 'LED Lighting Package', 'Complete LED upgrade for headlights and taillights', 'Exterior', 15000, '2025-12-25 06:39:21.378099+00'),
  ('9b1616be-271d-4f12-b495-b2398dc38dc2', 'Audio System Upgrade', 'Premium audio system with subwoofer', 'Interior', 25000, '2025-12-25 06:39:21.378099+00'),
  ('fa1c77d4-01b3-4b9f-b15e-7758375618e2', 'Window Tinting', 'High-quality solar window tint', 'Exterior', 8000, '2025-12-25 06:39:21.378099+00'),
  ('60056759-5660-41db-94e2-be5fc94228e6', 'Ceramic Coating', '9H ceramic coating for paint protection', 'Protection', 30000, '2025-12-25 06:39:21.378099+00'),
  ('8beaa992-58f5-4778-bf38-212985f10db2', 'Coilover Suspension', 'Adjustable coilover suspension system', 'Performance', 55000, '2025-12-25 06:39:21.378099+00'),
  ('aa45df06-4925-45aa-aa5d-6ed893f1c359', 'Cold Air Intake', 'Performance air intake system', 'Performance', 12000, '2025-12-25 06:39:21.378099+00'),
  ('70ff890e-118f-450a-8cea-5dfdae16e10a', 'Front Grille Upgrade', 'Custom sport grille replacement', 'Exterior', 8000, '2025-12-25 06:39:21.378099+00'),
  ('50c74b19-1090-41f1-ae06-f8834706e51d', 'Carbon Fiber Accessories', 'Carbon fiber mirror caps, spoiler, and trim', 'Exterior', 35000, '2025-12-25 06:39:21.378099+00'),
  ('9ebee77d-1fab-4b9c-9120-dc2d2a0f9477', 'Dashcam Installation', 'Front and rear dashcam with parking mode', 'Electronics', 12000, '2025-12-25 06:39:21.378099+00');

-- products (NOTE: image_url references the old Supabase storage - you'll need to re-upload images)
INSERT INTO public.products (id, seller_id, name, description, brand, category, price, original_price, stock, image_url, compatibility, rating, review_count, is_active, created_at) VALUES
  ('b736f908-72fa-4763-a35c-5db3a8ef4139', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Interior', NULL, 'Mahindra Thar', 'Interior', 1100000, NULL, 65, NULL, '{}', 0, 0, true, '2026-02-10 05:44:52.165933+00'),
  ('afcd9455-018f-4689-827f-870bc79342b2', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Interior', NULL, 'Maruti Suzuki', 'Interior', 1399900, 1699900, 7, NULL, '{}', 0, 0, true, '2026-02-10 05:46:07.893144+00'),
  ('849487d2-88a3-4afa-bb83-0148b724e6de', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Exterior Part', NULL, 'Honda City', 'Exterior', 859600, NULL, 50, NULL, '{}', 0, 0, true, '2026-02-10 05:47:24.987708+00'),
  ('411f8a68-2515-4cf1-957f-3fe0cbb3b3a0', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Accessories', NULL, 'Fortuner', 'Accessories', 865900, 1299900, 5, NULL, '{}', 0, 0, true, '2026-02-10 05:48:57.776109+00'),
  ('b46d55d5-4eba-4cbc-8b66-adcff106e3c9', 'ec754600-f0aa-423a-b1d3-ac7f6f111e42', 'DIAMOND CUT ALLOY', '19" INC AND 18 "INC SIZE', 'BMW', 'Wheels & Tires', 1000000, NULL, 30, NULL, '{BMW ALL CAR}', 0, 0, true, '2026-02-05 05:54:38.141586+00'),
  ('bd49b8b5-7750-41bd-b034-f6dc5e9c0261', 'ec754600-f0aa-423a-b1d3-ac7f6f111e42', 'ALLOY', NULL, 'M', 'Wheels & Tires', 3500000, 3700000, 50, NULL, '{}', 0, 0, true, '2026-02-05 05:57:09.958478+00'),
  ('17288e1f-e182-439e-a1e1-7c766104a3d6', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Tail Light', NULL, 'Maruti Suzuki', 'Lighting', 400000, 500000, 30, NULL, '{}', 0, 0, true, '2026-02-09 18:11:27.422521+00'),
  ('3c0d93a0-151d-4a0a-8e75-ecbb726005a5', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Lights', NULL, 'Maruti Suzuki', 'Lighting', 350000, NULL, 10, NULL, '{}', 0, 0, true, '2026-02-10 04:28:17.733677+00'),
  ('c2320f81-0f4d-4562-b6b7-8efc65dba7eb', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Tail Light', NULL, 'Hyundai', 'Lighting', 330000, 400000, 12, NULL, '{}', 0, 0, true, '2026-02-10 04:29:21.462451+00'),
  ('934145a2-9f75-4634-a721-db6a5959be8d', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Steering', NULL, 'Maruti Suzuki', 'Interior', 420000, NULL, 5, NULL, '{}', 0, 0, true, '2026-02-10 04:31:00.606918+00'),
  ('0faee31d-64c5-45f3-8679-a96d679e366f', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Steering', NULL, 'Honda City', 'Interior', 500000, 650000, 25, NULL, '{}', 0, 0, true, '2026-02-10 04:32:09.447316+00'),
  ('4ec9e590-331c-49dd-9f56-7facf598dc0c', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Steering', NULL, 'Audi', 'Interior', 560000, NULL, 3, NULL, '{}', 0, 0, true, '2026-02-10 04:33:09.692846+00'),
  ('e515b1c7-bdf0-4b0d-8448-45ef72f669dc', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Steering', NULL, 'BMW', 'Interior', 390000, 500000, 12, NULL, '{}', 0, 0, true, '2026-02-10 04:34:56.302753+00'),
  ('65dda0ce-e286-42ba-924b-3a92f30c2f34', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Steering', NULL, 'Rolls-Royce', 'Interior', 480000, 680000, 42, NULL, '{}', 0, 0, true, '2026-02-10 04:35:56.976536+00'),
  ('8d909e44-64bd-4106-89af-f91709f27714', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Seats', NULL, 'Maruti Suzuki', 'Interior', 590000, NULL, 50, NULL, '{}', 0, 0, true, '2026-02-10 04:37:10.490382+00'),
  ('3e10bd7d-cd11-4570-8b88-c0712057d7e0', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Seats', NULL, 'Hyundai', 'Interior', 550000, NULL, 60, NULL, '{}', 0, 0, true, '2026-02-10 04:37:55.264948+00'),
  ('b8518cf9-8b69-413a-95d2-5311674ea68b', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Seats', NULL, 'Honda City', 'Interior', 700000, NULL, 13, NULL, '{}', 0, 0, true, '2026-02-10 04:38:52.901683+00'),
  ('2d3878a4-6ab8-4fe4-81db-f149b323a5ed', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Steering', NULL, 'BMW', 'Interior', 670000, NULL, 19, NULL, '{}', 0, 0, true, '2026-02-10 04:39:45.338182+00'),
  ('57a94023-1b74-424d-9094-f3f91e009359', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Front Light', NULL, 'Hyundai', 'Lighting', 800000, 999900, 50, NULL, '{}', 0, 0, true, '2026-02-10 04:40:59.352203+00'),
  ('2a612aa6-02af-457c-82ed-06ab84cf6c1e', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Interior', NULL, 'Maruti Suzuki', 'Interior', 800000, NULL, 45, NULL, '{}', 0, 0, true, '2026-02-10 04:42:37.678446+00'),
  ('bd706241-e0d6-4317-8138-2e5c81b8f758', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Performance', NULL, 'Maruti Suzuki', 'Performance Parts', 999900, NULL, 45, NULL, '{}', 0, 0, true, '2026-02-10 05:41:57.170081+00'),
  ('21cb08da-81e2-4b5c-a89a-1180489cbd6b', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Performance parts', NULL, 'Honda City', 'Performance Parts', 1200000, 1599900, 50, NULL, '{}', 0, 0, true, '2026-02-10 05:43:17.969462+00'),
  ('b22111b7-99f5-4318-87d1-5b2b346d0f49', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Accessories', NULL, 'Mahindra Thar', 'Accessories', 839200, NULL, 88, NULL, '{}', 0, 0, true, '2026-02-10 05:50:14.586955+00'),
  ('c9188386-09aa-405a-8afb-2ba9108fcf7d', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Accessories', NULL, 'Hyundai', 'Accessories', 744600, NULL, 99, NULL, '{}', 0, 0, true, '2026-02-10 05:51:09.70911+00'),
  ('6c45b8f9-bda8-41d3-b2d8-66c71ab8b955', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Interior Part', NULL, 'Honda City', 'Engine', 1029900, NULL, 89, NULL, '{}', 0, 0, true, '2026-02-10 05:52:12.27226+00'),
  ('90de20b9-1a91-44f3-b599-5d53d7a639a0', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Interior Engine', NULL, 'BMW', 'Engine', 1233300, 1963800, 57, NULL, '{}', 0, 0, true, '2026-02-10 05:53:14.885392+00'),
  ('18639776-c48b-4339-bcd4-c55711aee785', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Interior Part', NULL, 'Maruti Suzuki', 'Accessories', 1599900, NULL, 35, NULL, '{}', 0, 0, true, '2026-02-10 05:54:30.223585+00'),
  ('ca5285da-fc15-4d66-ae25-a185b81a45f5', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Tail Light', NULL, 'Hyundai', 'Accessories', 593800, NULL, 59, NULL, '{}', 0, 0, true, '2026-02-10 05:55:28.340848+00'),
  ('cb4520ac-6129-4b5a-8a83-d661a50fab10', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Wheels', NULL, 'Rolls-Royce', 'Wheels & Tires', 899900, 1263900, 88, NULL, '{}', 0, 0, true, '2026-02-10 05:56:26.77038+00'),
  ('a6968dd1-2fdd-454c-8c91-0160689d2025', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Wheels', NULL, 'Honda City', 'Wheels & Tires', 999900, NULL, 43, NULL, '{}', 0, 0, true, '2026-02-10 05:57:11.547754+00'),
  ('a3264b1d-7df3-41ef-a6fc-dccf8b2d99dc', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Wheels', NULL, 'Fortuner', 'Wheels & Tires', 889900, NULL, 66, NULL, '{}', 0, 0, true, '2026-02-10 05:58:17.802019+00'),
  ('c8282d9e-313f-48ef-adb3-9d3ef0e8ad89', '2bc8e971-530a-4ae3-a53e-396f21658caf', 'Wheels', NULL, 'Maruti Suzuki', 'Wheels & Tires', 960000, 1360000, 56, NULL, '{}', 0, 0, true, '2026-02-10 06:59:49.531048+00');

-- profiles (NOTE: user_id references auth.users which you'll need to recreate manually)
-- You'll need to create these users in your new Supabase Auth first, then insert profiles with matching user_ids
-- Original data for reference:
-- user_id: 2bc8e971-530a-4ae3-a53e-396f21658caf, name: NihalThumar (admin)
-- user_id: 849b0e92-a2b1-4b26-832f-8c5c141b17cd, name: kedar (customer)
-- user_id: ec754600-f0aa-423a-b1d3-ac7f6f111e42, name: Nihal thumar (seller, approved)
-- user_id: c10e7e81-3356-472a-9024-e0c7df1db5ba, name: Vaghela kartik (customer)

-- After creating users in Auth, insert profiles:
-- INSERT INTO public.profiles (user_id, full_name, is_blocked, seller_approved) VALUES
--   ('<admin_user_id>', 'NihalThumar', false, false),
--   ('<customer_user_id>', 'kedar', false, false),
--   ('<seller_user_id>', 'Nihal thumar', false, true),
--   ('<customer2_user_id>', 'Vaghela kartik', false, false);

-- After creating users, insert roles:
-- INSERT INTO public.user_roles (user_id, role) VALUES
--   ('<admin_user_id>', 'admin'),
--   ('<customer_user_id>', 'customer'),
--   ('<seller_user_id>', 'seller'),
--   ('<customer2_user_id>', 'customer');

-- orders (will need user_id remapping after creating new users)
-- INSERT INTO public.orders (id, user_id, total_amount, status, shipping_address, phone, created_at, updated_at) VALUES
--   ('6782bc13-7c13-43e7-9b3d-8d746aefb517', '<customer_user_id>', 799996, 'completed', 'G Tb', '+919664663036', '2025-12-25 09:48:32.661057+00', '2025-12-25 10:04:47.916376+00'),
--   ('3ec60e3f-ccbc-44df-8648-dfee3ca4a9d3', '<customer_user_id>', 199999, 'cancelled', 'G Tb', '09664663036', '2025-12-25 10:18:00.80058+00', '2025-12-25 10:31:48.703744+00'),
--   ('0745fee9-6e57-4384-a955-5f32c3ac1dad', '<customer_user_id>', 199999, 'cancelled', 'G Tb', '09664663036', '2025-12-25 09:57:24.341201+00', '2025-12-25 10:32:49.410606+00'),
--   ('b5dad215-c6f0-4553-83c1-114cb462b996', '<customer_user_id>', 199999, 'cancelled', 'G Tb', '+919664663036', '2025-12-25 09:40:30.934301+00', '2025-12-25 10:33:00.000504+00'),
--   ('6f3f1f09-c79b-4b55-aa3f-4c93e3e620dd', '<customer_user_id>', 200000, 'pending', 'Nihal Thumar\nG Tb\nPincode: 360575', '0966466303', '2025-12-25 13:31:57.5684+00', '2025-12-25 13:31:57.5684+00'),
--   ('2250f7fd-06cc-486f-a5d5-8fe7d9935158', '<customer_user_id>', 200000, 'pending', 'Nihal Thumar\nG Tb\nPincode: 360575', '0966466303', '2025-12-25 14:28:34.894815+00', '2025-12-25 14:28:34.894815+00'),
--   ('a9c8d0ae-3da8-4040-af72-6c5ed5203861', '<customer2_user_id>', 200000, 'cancelled', 'Vaghela kartik\nSavvy strata A101 Ahemdabad\nPincode: 382210', '7016167090', '2025-12-25 14:28:38.942577+00', '2025-12-25 14:30:20.692036+00'),
--   ('dd46eec5-8ea3-43a8-86eb-dae3f05cb6eb', '<seller_user_id>', 1000000, 'pending', 'yhhh\nsdfghj\nPincode: 380052', '9664663036', '2026-02-05 06:23:25.921885+00', '2026-02-05 06:23:25.921885+00'),
--   ('1c28a9da-1f71-4d75-b71a-10f9bcef10ef', '<customer_user_id>', 199999, 'cancelled', 'Nihal Thumar\nG Tb\nPincode: 360575', '9664663036', '2025-12-25 10:30:19.150204+00', '2026-02-09 18:06:52.465695+00');

-- order_items (uncomment after orders are inserted)
-- INSERT INTO public.order_items (id, order_id, product_name, quantity, price, created_at) VALUES
--   ('95863642-876d-43e6-a341-832db3493bd7', '3ec60e3f-ccbc-44df-8648-dfee3ca4a9d3', 'fhndn', 1, 199999, '2025-12-25 10:18:01.117212+00'),
--   ('50ca033a-455d-4089-a634-b1a206ef64a5', '1c28a9da-1f71-4d75-b71a-10f9bcef10ef', 'fhndn', 1, 199999, '2025-12-25 10:30:19.505653+00'),
--   ('36298a6b-ba90-4527-90f1-bcfe4d1ba914', '6f3f1f09-c79b-4b55-aa3f-4c93e3e620dd', 'vvf', 1, 200000, '2025-12-25 13:31:57.981608+00'),
--   ('0b05f44f-1621-4362-b664-ecd4405e89b6', '2250f7fd-06cc-486f-a5d5-8fe7d9935158', 'vvf', 1, 200000, '2025-12-25 14:28:35.332994+00'),
--   ('55a45710-9d3f-4d73-a382-ca9f897d393e', 'a9c8d0ae-3da8-4040-af72-6c5ed5203861', 'vvf', 1, 200000, '2025-12-25 14:28:39.458714+00'),
--   ('c8bfd02e-3296-4842-a8f6-312e43e297c2', 'dd46eec5-8ea3-43a8-86eb-dae3f05cb6eb', 'DIAMOND CUT ALLOY', 1, 1000000, '2026-02-05 06:23:26.735695+00');

-- saved_designs (uncomment after users are created)
-- INSERT INTO public.saved_designs (id, user_id, car_model_id, name, color, modifications, total_cost, created_at) VALUES
--   ('b3f3ad3e-54a1-420b-8193-f8f63f52c007', '<customer_user_id>', 'd251276d-d220-424c-8e32-e12d45346f5a', 'Honda Amaze Build', '#e63946', '{"bumperType":"standard","decalType":"flames","headlightType":"standard","spoilerType":"none","wheelType":"standard"}', 12000, '2026-01-11 15:53:58.985135+00'),
--   ('206dca05-ea56-4bae-aa45-8789f01f3cb9', '<customer_user_id>', 'd251276d-d220-424c-8e32-e12d45346f5a', 'Honda Amaze Build', '#e63946', '{"bumperType":"standard","decalType":"flames","headlightType":"standard","spoilerType":"none","wheelType":"standard"}', 12000, '2026-01-11 15:54:21.976023+00');

-- cart_items, wishlists, order_status_history: Currently empty, no data to migrate.

-- =====================================================
-- IMPORTANT NOTES:
-- 1. Create users in Supabase Auth FIRST (the handle_new_user trigger will auto-create profiles/roles)
-- 2. If you want exact data, disable the trigger, insert profiles/roles manually, then re-enable
-- 3. Product images need to be re-uploaded to your new storage buckets
-- 4. Update your app's SUPABASE_URL and SUPABASE_ANON_KEY to point to the new project
-- =====================================================
