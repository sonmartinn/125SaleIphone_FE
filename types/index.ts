export interface ProductVariant {
  IdProductVar?: string
  Color: string
  Price: number
  Stock: number
  ImgPath?: string | null
}

export interface Product {
  id?: string;
  IdProduct?: string;
  name?: string;
  NameProduct?: string;
  subtitle?: string;
  Decription?: string;
  description?: string;
  price?: number;
  PriceProduct?: number;
  originalPrice?: number;
  image?: string;
  ImageProduct?: string;
  category?: 'iphone' | 'accessory';
  IdCategory?: string;
  colors?: string[];
  storage?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  selectedVariant?: ProductVariant;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
