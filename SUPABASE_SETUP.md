# Supabase Setup Instructions

## 1. Required SQL (already applied via migration)

The following schema has already been applied to your Supabase project:

- `categories` - Product categories (id, name, slug)
- `products` - Full product catalog with images[], SKU, stock, sale_percentage, featured, is_active
- `orders` - Customer orders prepared for Stripe (payment_status, order_status, stripe_session_id)
- `order_items` - Line items per order
- `user_profiles` - Extended user profiles with is_admin flag

All tables have Row Level Security (RLS) enabled with these rules:
- Visitors (anon) can only see active products (`is_active = true`)
- Admin users (is_admin = true) can create, edit, delete all products
- Authenticated users can manage their own profiles and orders
- The `is_admin()` function checks admin status in user_profiles

## 2. Storage Bucket Setup

In your Supabase Dashboard, go to **Storage** and create a bucket:

- **Bucket name:** `product-images`
- **Public:** Yes (enable public access so product images are viewable on the storefront)
- **Allowed MIME types:** `image/*`
- **File size limit:** 5MB recommended

After creating the bucket, set the bucket policy to allow uploads:

```sql
-- Allow authenticated users to upload to product-images bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Allow public read access
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images');
```

## 3. Authentication Providers to Enable

In Supabase Dashboard, go to **Authentication > Providers** and enable:

### Email (enabled by default)
- Confirm email: **OFF** (disable email confirmation for smoother UX)

### Google OAuth
- Go to **Authentication > Providers > Google**
- Enable Google provider
- Set up your Google OAuth credentials in Google Cloud Console:
  - Create OAuth 2.0 credentials
  - Add authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
  - Copy Client ID and Client Secret to Supabase

## 4. Make Yourself an Admin

After registering your first account, run this SQL to make yourself admin:

```sql
UPDATE public.user_profiles SET is_admin = true WHERE email = 'your-email@example.com';
```

## 5. Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://cgtzqmrwmbrzdpyobslp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndHpxbXJ3bWJyemRweW9ic2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTk1OTMsImV4cCI6MjA5Nzk3NTU5M30.lSEVVQ-nc41RXdFzC6d0_XQHPClr95laVo8eI6O1kdE
```

No other environment variables are required for the current feature set.

## 6. Next Steps for Stripe Integration

When you're ready to add Stripe payments:

1. Create a Stripe account and get your API keys
2. Add these environment variables:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. Create a Supabase Edge Function for Stripe Checkout
4. Update the orders table to track Stripe session IDs
