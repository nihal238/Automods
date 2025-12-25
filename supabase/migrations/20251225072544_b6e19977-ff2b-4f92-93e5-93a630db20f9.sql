-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Add policy for admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add is_blocked column to profiles for blocking sellers/users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Add seller_approved column for seller approval workflow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_approved BOOLEAN DEFAULT false;