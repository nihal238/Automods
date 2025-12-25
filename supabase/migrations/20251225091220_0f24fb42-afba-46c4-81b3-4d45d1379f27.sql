-- Create storage bucket for car model images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-model-images', 'car-model-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Anyone can view car model images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-model-images');

-- Allow admins to upload car model images
CREATE POLICY "Admins can upload car model images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'car-model-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update car model images
CREATE POLICY "Admins can update car model images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'car-model-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete car model images
CREATE POLICY "Admins can delete car model images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'car-model-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);