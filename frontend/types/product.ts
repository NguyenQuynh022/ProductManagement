export interface Product {
  _id: string;
  name: string;
  price: number;
  soluong: number;
  image: string;
}

export interface ProductFormData {
  name: string;
  price: string;
  soluong: string;
  image: string;
}

export interface AdminUser {
  username: string;
  role: string;
}

