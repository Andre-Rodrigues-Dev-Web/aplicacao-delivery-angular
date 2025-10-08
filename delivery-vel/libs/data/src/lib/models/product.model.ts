export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  preparationTime: number; // em minutos
  isAvailable: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  tags: string[];
  nutritionalInfo?: NutritionalInfo;
  ingredients?: string[];
  allergens?: string[];
  restaurant: Restaurant;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  emoji?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface NutritionalInfo {
  calories: number;
  protein: number; // gramas
  carbs: number; // gramas
  fat: number; // gramas
  fiber?: number; // gramas
  sodium?: number; // mg
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number; // em minutos
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  cuisine: string[];
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface ProductFilter {
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  restaurantIds?: string[];
  tags?: string[];
  searchTerm?: string;
}

export interface ProductSort {
  field: 'name' | 'price' | 'rating' | 'preparationTime' | 'popularity';
  direction: 'asc' | 'desc';
}

// Request/Response types
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  categoryId: string;
  preparationTime: number;
  tags: string[];
  nutritionalInfo?: NutritionalInfo;
  ingredients?: string[];
  allergens?: string[];
  restaurantId: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isAvailable?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}