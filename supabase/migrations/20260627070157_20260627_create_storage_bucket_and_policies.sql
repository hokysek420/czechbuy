/*
# Create product-images Storage bucket and policies

1. New Storage Bucket
- `product-images` - Stores all product images uploaded by admins

2. Security
- Enable RLS on the bucket
- Allow authenticated admins to upload, update and delete images
- Allow public read access for storefront display
- Allow authenticated users to read images
*/

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for authenticated users (admins) to upload
DROP POLICY IF EXISTS "product-images-insert-authenticated" ON storage.objects;
CREATE POLICY "product-images-insert-authenticated"
ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Policies for authenticated users (admins) to update
DROP POLICY IF EXISTS "product-images-update-authenticated" ON storage.objects;
CREATE POLICY "product-images-update-authenticated"
ON storage.objects FOR UPDATE
TO authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

-- Policies for authenticated users (admins) to delete
DROP POLICY IF EXISTS "product-images-delete-authenticated" ON storage.objects;
CREATE POLICY "product-images-delete-authenticated"
ON storage.objects FOR DELETE
TO authenticated USING (bucket_id = 'product-images');

-- Allow public/anonymous read access for storefront
DROP POLICY IF EXISTS "product-images-select-public" ON storage.objects;
CREATE POLICY "product-images-select-public"
ON storage.objects FOR SELECT
TO anon, authenticated USING (bucket_id = 'product-images');
