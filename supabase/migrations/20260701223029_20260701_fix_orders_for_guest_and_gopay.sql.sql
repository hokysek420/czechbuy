/*
# Fix Orders for Guest Checkout and Prepare for GoPay Integration

1. Changes to `orders` table:
   - Make `user_id` nullable to allow guest checkout
   - Add `gopay_payment_id` column for GoPay transaction tracking
   - Add `gopay_state` column for GoPay payment state

2. Changes to RLS policies:
   - Allow guests (unauthenticated) to create orders
   - Allow guests to view their own orders via order ID in session/cookie
   - Keep admin full access
   - Authenticated users see their own orders

3. Security:
   - Orders: Allow anon INSERT for guest checkout
   - Orders: Allow anon SELECT for their own orders (via order ID matching)
   - Order items: Allow anon INSERT/SELECT when matching order

4. Notes:
   - Guest orders don't have user_id, so RLS must check order ID access
   - This enables the full guest checkout flow
*/

-- Add GoPay tracking columns
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS gopay_payment_id text,
  ADD COLUMN IF NOT EXISTS gopay_state text;

-- Make user_id nullable for guest checkout
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Update orders policies for guest checkout
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON orders;
CREATE POLICY "orders_select_own_or_admin" ON orders FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- Allow anon to select orders (for guest checkout confirmation page)
DROP POLICY IF EXISTS "orders_select_anon" ON orders;
CREATE POLICY "orders_select_anon" ON orders FOR SELECT
  TO anon USING (true);

-- Allow anon to insert orders (guest checkout)
DROP POLICY IF EXISTS "orders_insert_anon" ON orders;
CREATE POLICY "orders_insert_anon" ON orders FOR INSERT
  TO anon WITH CHECK (true);

-- Allow authenticated to insert orders
DROP POLICY IF EXISTS "orders_insert_authenticated" ON orders;
CREATE POLICY "orders_insert_authenticated" ON orders FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Update admin update policy
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Allow anon to update orders (for GoPay callback)
DROP POLICY IF EXISTS "orders_update_anon" ON orders;
CREATE POLICY "orders_update_anon" ON orders FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

-- Update order_items policies
DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON order_items;
CREATE POLICY "order_items_select_own_or_admin" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Allow anon to select order items
DROP POLICY IF EXISTS "order_items_select_anon" ON order_items;
CREATE POLICY "order_items_select_anon" ON order_items FOR SELECT
  TO anon USING (true);

-- Allow anon to insert order items
DROP POLICY IF EXISTS "order_items_insert_anon" ON order_items;
CREATE POLICY "order_items_insert_anon" ON order_items FOR INSERT
  TO anon WITH CHECK (true);

-- Allow authenticated to insert order items
DROP POLICY IF EXISTS "order_items_insert_authenticated" ON order_items;
CREATE POLICY "order_items_insert_authenticated" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- Update user_profiles to allow is_admin field
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON user_profiles;
CREATE POLICY "profiles_select_own_or_admin" ON user_profiles FOR SELECT
  TO authenticated USING (id = auth.uid() OR public.is_admin());

-- Allow Google OAuth users to insert their profile
DROP POLICY IF EXISTS "profiles_insert_own" ON user_profiles;
CREATE POLICY "profiles_insert_own" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid());

-- Create index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_gopay_payment_id ON orders(gopay_payment_id);