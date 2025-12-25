-- Create a function to check if a seller is approved
CREATE OR REPLACE FUNCTION public.is_seller_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT seller_approved FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Drop existing seller policy
DROP POLICY IF EXISTS "Sellers can manage their own products" ON public.products;

-- Create new policy that requires seller approval
CREATE POLICY "Approved sellers can manage their own products"
ON public.products
FOR ALL
USING (
  auth.uid() = seller_id 
  AND public.has_role(auth.uid(), 'seller'::app_role) 
  AND public.is_seller_approved(auth.uid())
)
WITH CHECK (
  auth.uid() = seller_id 
  AND public.has_role(auth.uid(), 'seller'::app_role) 
  AND public.is_seller_approved(auth.uid())
);

-- Allow admins to delete profiles (for seller removal)
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));