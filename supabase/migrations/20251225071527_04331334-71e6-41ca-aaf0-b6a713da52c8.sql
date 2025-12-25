-- Drop existing overly permissive upload policy
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;

-- Create new restricted upload policy for sellers and admins only
CREATE POLICY "Only sellers and admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('seller', 'admin')
  )
);