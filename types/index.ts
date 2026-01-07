export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'iphone' | 'accessory';
  colors?: string[];
  storage?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
