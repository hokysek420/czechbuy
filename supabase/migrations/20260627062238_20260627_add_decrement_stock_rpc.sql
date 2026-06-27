/*
# Add decrement_stock RPC

1. New Function
- `decrement_stock(product_id, qty)` - Safely decrements product stock quantity
- Prevents negative stock by checking current quantity
- Used during checkout to reserve inventory
*/

CREATE OR REPLACE FUNCTION public.decrement_stock(product_id uuid, qty integer)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET stock_quantity = stock_quantity - qty
  WHERE id = product_id AND stock_quantity >= qty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
