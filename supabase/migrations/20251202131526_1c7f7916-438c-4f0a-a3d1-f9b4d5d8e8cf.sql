-- Remove the dangerous policy that exposes customer PII to everyone
DROP POLICY IF EXISTS "Users can view completed orders by order ID" ON orders;

-- Create admin-only policy for viewing orders (needed for Admin panel)
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (has_role(auth.uid(), 'admin'));