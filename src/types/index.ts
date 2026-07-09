export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface Drop {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string | null;
  createdAt: string;
  products: Product[];
}

export interface Product {
  id: string;
  dropId: string;
  name: string;
  price: number;
  totalStock: number;
  availableStock: number;
  recentPurchasers: RecentPurchaser[];
  createdAt: string;
}

export interface RecentPurchaser {
  username: string;
  purchasedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  productId: string;
  status: string;
  expiresAt: string;
  product?: Product;
}

export interface Purchase {
  id: string;
  productId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
