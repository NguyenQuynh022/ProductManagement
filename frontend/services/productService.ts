import apiClient from './api';
import { Product } from '../types/product';
import { API_BASE_URL } from '../constants/api';

export const productService = {
  // 1. Lấy danh sách sản phẩm (có tìm kiếm & sắp xếp)
  async getProducts(params?: { search?: string; sort?: string }): Promise<{ success: boolean; count: number; data: Product[] }> {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // 2. Lấy chi tiết 1 sản phẩm
  async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // 3. Thêm mới sản phẩm (chỉ gửi đúng 4 trường: name, price, soluong, image)
  async createProduct(productData: {
    name: string;
    price: number;
    soluong: number;
    image: string;
  }): Promise<{ success: boolean; message: string; data: Product }> {
    const payload = {
      name: productData.name.trim(),
      price: Number(productData.price),
      soluong: Number(productData.soluong),
      image: productData.image.trim(),
    };
    const response = await apiClient.post('/products', payload);
    return response.data;
  },

  // 4. Cập nhật sản phẩm (chỉ gửi 4 trường cho phép)
  async updateProduct(
    id: string,
    productData: {
      name?: string;
      price?: number;
      soluong?: number;
      image?: string;
    }
  ): Promise<{ success: boolean; message: string; data: Product }> {
    const payload: Record<string, any> = {};
    if (productData.name !== undefined) payload.name = productData.name.trim();
    if (productData.price !== undefined) payload.price = Number(productData.price);
    if (productData.soluong !== undefined) payload.soluong = Number(productData.soluong);
    if (productData.image !== undefined) payload.image = productData.image.trim();

    const response = await apiClient.put(`/products/${id}`, payload);
    return response.data;
  },

  // 5. Xóa sản phẩm
  async deleteProduct(id: string): Promise<{ success: boolean; message: string; data: Product }> {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // 6. Upload hình ảnh
  async uploadImage(formData: FormData): Promise<{ success: boolean; image: string; url: string; filename: string }> {
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 7. Xuất file JSON
  async exportJson(): Promise<{ success: boolean; message: string; path: string }> {
    const response = await apiClient.post('/products/export');
    return response.data;
  }
};

