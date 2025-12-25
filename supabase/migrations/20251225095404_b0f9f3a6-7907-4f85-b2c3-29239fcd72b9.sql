-- Remove seller access to order items (only admins manage orders now)
DROP POLICY IF EXISTS "Sellers can view their order items" ON public.order_items;

-- Add admin policies for order_items
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update order items"
ON public.order_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));