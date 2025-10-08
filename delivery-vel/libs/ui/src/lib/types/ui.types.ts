export interface ButtonConfig {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export interface CardConfig {
  variant: 'default' | 'elevated' | 'outlined';
  padding: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export interface ModalConfig {
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
  centered?: boolean;
}

export interface BadgeConfig {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  size: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export interface LoadingConfig {
  type: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface InputConfig {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  size: 'sm' | 'md' | 'lg';
  variant: 'default' | 'filled' | 'outlined';
  error?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export interface ProductCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  available: boolean;
  tags?: string[];
  discount?: number;
}

export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: { [key: string]: string };
  notes?: string;
}

export interface OrderStatusData {
  status: 'received' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  timestamp: Date;
  estimatedTime?: number;
  deliveryAddress?: string;
  delivererName?: string;
  delivererPhone?: string;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface ToastConfig {
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  closable?: boolean;
}