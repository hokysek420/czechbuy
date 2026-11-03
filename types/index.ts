export type ProductCategory = 'parfemy' | 'obleceni' | 'boty';

export type FragranceConcentration = 'EdP' | 'EdT' | 'Parfum' | 'Extrait';

export type FragranceGender = 'panske' | 'damske' | 'unisex';

export interface VolumeVariant {
  volume: string;
  price: number;
  inStock: number;
}

export interface ScentNotes {
  head: string[];  // Hlava vůně (vrchní tóny)
  heart: string[]; // Srdce vůně (střední tóny)
  base: string[];  // Základ vůně (spodní tóny)
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  volume: string;
  volumeVariants: VolumeVariant[];
  stock: number;
  concentration: FragranceConcentration;
  gender: FragranceGender;
  scentNotes: ScentNotes;
  description: string;
  image: string;
  featured: boolean;
  isNew?: boolean;
}

export interface CartItem {
  id: string; // composite key: `${productId}-${volume}`
  productId: string;
  name: string;
  brand: string;
  volume: string;
  price: number;
  image: string;
  quantity: number;
  concentration: FragranceConcentration;
}

export type OrderStatus = 'nova' | 'zpracovava_se' | 'odeslano' | 'doruceno' | 'stornovano';

export type ShippingMethod = 'zasilkovna' | 'ppl' | 'dpd' | 'osobni';

export type PaymentMethod = 'karta' | 'apple_pay' | 'dobirka' | 'prevod';

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  note?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  shippingPrice: number;
  paymentPrice: number;
  subtotal: number;
  totalPrice: number;
  status: OrderStatus;
}
