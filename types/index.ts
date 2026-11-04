export type ProductCategory = 'parfemy' | 'obleceni' | 'boty' | 'digital';

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
  volume?: string;
  volumeVariants?: VolumeVariant[];
  stock: number;
  concentration?: FragranceConcentration;
  gender?: FragranceGender;
  scentNotes?: ScentNotes;
  description: string;
  image?: string;
  featured: boolean;
  isNew?: boolean;

  // Specific attributes for Oblečení
  clothingSizes?: string[]; // e.g. ["S", "M", "L", "XL"]
  material?: string;
  fit?: string;
  color?: string;

  // Specific attributes for Boty
  shoeSizes?: string[]; // e.g. ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"]
  colorway?: string;
  sku?: string;
  condition?: string;

  // Specific attributes for Digital
  platform?: string; // "Steam", "PlayStation", "Xbox", "PC", "Spotify"
  licenseType?: string; // "Trvalá licence", "Předplatné", "Kód"
  region?: string; // "Global / Region Free", "Evropa / CZ"
  deliveryTime?: string;
}

export interface CartItem {
  id: string; // composite key: `${productId}-${variantOrVolume}`
  productId: string;
  name: string;
  brand: string;
  volume?: string;
  size?: string;
  category?: ProductCategory;
  price: number;
  image?: string;
  quantity: number;
  concentration?: FragranceConcentration;
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
  discordUsername?: string;
  discordId?: string;
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


export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator?: string;
  avatar?: string | null;
  avatarUrl: string;
  email?: string | null;
  verified?: boolean;
  isCzechBuyFam?: boolean;
  joinedAt?: string;
}
