import { Product } from './product.model';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
  options?: { [key: string]: string };
  subtotal: number;
  addedAt: Date;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  notes?: string;
  options?: { [key: string]: string };
}

export interface UpdateCartItemRequest {
  quantity: number;
  notes?: string;
  options?: { [key: string]: string };
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}