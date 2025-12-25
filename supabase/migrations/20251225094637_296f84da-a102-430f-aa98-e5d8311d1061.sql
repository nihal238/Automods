-- Add policy for admins to update orders (for status changes)
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));