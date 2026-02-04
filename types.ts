
export enum View {
  LANDING = 'landing',
  LOGIN_CLIENT = 'login_client',
  LOGIN_STAFF = 'login_staff',
  CATALOG = 'catalog',
  CART = 'cart',
  FIDELITY = 'fidelity',
  STAFF = 'staff'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  outOfStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  timestamp: string;
  customerName: string;
  customerType: 'VIP' | 'Regular';
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  avatar: string;
}

export interface User {
  id: string;
  nickname: string;
  rpName: string;
  role: 'User' | 'Staff' | 'Manager';
  points: number;
  tier: 'Gold' | 'Regular';
  email?: string;
}
