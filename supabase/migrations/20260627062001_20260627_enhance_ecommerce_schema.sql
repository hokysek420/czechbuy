/*
# Enhance E-commerce Schema for CzechBuy

1. Changes to `orders` table:
   - Expand `order_status` to include: pending, awaiting_payment, paid, processing, shipped, delivered, cancelled
   - Expand `payment_status` to include: pending, awaiting_payment, paid, failed, refunded
   - Add `payment_method` column (bank_transfer, gopay, card)
   - Add `variable_symbol` column for bank transfer tracking
   - Add `shipping_address` JSONB for full address storage
   - Add `phone` column for contact
   - Rename `stripe_session_id` to `payment_reference` for generic payment tracking

2. New `reviews` table:
   - Customer product reviews with rating (1-5), comment, and moderation flag

3. New `payment_logs` table:
   - Audit trail for all payment attempts and callbacks

4. Security:
   - Update RLS policies for expanded order statuses
   - Reviews: public read, authenticated users can create their own
   - Payment logs: admin-only access
*/

-- Update orders table columns
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'gopay', 'card')),
  ADD COLUMN IF NOT EXISTS variable_symbol text,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS payment_reference text;

-- Drop old constraint and add new one for order_status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_order_status_check CHECK (order_status IN ('pending', 'awaiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Drop old constraint and add new one for payment_status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'awaiting_payment', 'paid', 'failed', 'refunded'));

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  payment_method text NOT NULL,
  action text NOT NULL,
  status text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Helper function for admin check (already exists but safe to recreate)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reviews policies
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT
  TO anon, authenticated USING (is_approved = true OR public.is_admin());

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reviews_delete_admin" ON reviews;
CREATE POLICY "reviews_delete_admin" ON reviews FOR DELETE
  TO authenticated USING (public.is_admin());

-- Payment logs policies (admin only)
DROP POLICY IF EXISTS "payment_logs_select_admin" ON payment_logs;
CREATE POLICY "payment_logs_select_admin" ON payment_logs FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "payment_logs_insert_authenticated" ON payment_logs;
CREATE POLICY "payment_logs_insert_authenticated" ON payment_logs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "payment_logs_update_admin" ON payment_logs;
CREATE POLICY "payment_logs_update_admin" ON payment_logs FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "payment_logs_delete_admin" ON payment_logs;
CREATE POLICY "payment_logs_delete_admin" ON payment_logs FOR DELETE
  TO authenticated USING (public.is_admin());

-- Update orders policies for new statuses
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON orders;
CREATE POLICY "orders_select_own_or_admin" ON orders FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_authenticated" ON orders;
CREATE POLICY "orders_insert_authenticated" ON orders FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_delete_admin" ON orders;
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE
  TO authenticated USING (public.is_admin());

-- Trigger for updated_at on reviews
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'reviews_updated_at') THEN
    CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
