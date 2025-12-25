-- Create enum for order status phases
CREATE TYPE public.order_status_phase AS ENUM (
  'order_placed',
  'payment_pending',
  'payment_confirmed',
  'order_confirmed',
  'processing',
  'packed',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded'
);

-- Create order_status_history table
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status order_status_phase NOT NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON public.order_status_history(created_at);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Customers can view status history for their own orders
CREATE POLICY "Users can view their order status history"
ON public.order_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_status_history.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Admins can view all status history
CREATE POLICY "Admins can view all order status history"
ON public.order_status_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert status updates
CREATE POLICY "Admins can insert order status history"
ON public.order_status_history
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update status history
CREATE POLICY "Admins can update order status history"
ON public.order_status_history
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;