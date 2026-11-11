// Helper xử lý ảnh sản phẩm: tự động thay thế link placeholder chậm bằng ảnh thật chất lượng cao
export const getProductImageUri = (imageUri?: string, productName?: string): string => {
  if (!imageUri || imageUri.trim() === '') {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  }

  // Nếu là ảnh do người dùng upload từ máy lên Backend (chứa /uploads/) hoặc link thật không phải placehold.co
  if (!imageUri.includes('placehold.co')) {
    return imageUri;
  }

  // Nếu là link placehold.co cũ, tự động hiển thị ảnh thật sắc nét theo từng mặt hàng bán chạy
  const nameLower = (productName || '').toLowerCase();

  if (nameLower.includes('iphone')) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80';
  }
  if (nameLower.includes('samsung') || nameLower.includes('galaxy')) {
    return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80';
  }
  if (nameLower.includes('macbook') || nameLower.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80';
  }
  if (nameLower.includes('ipad') || nameLower.includes('tablet')) {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80';
  }
  if (nameLower.includes('airpods') || nameLower.includes('tai nghe')) {
    return 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80';
  }

  // Ảnh mặc định đồ công nghệ / bán hàng
  return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80';
};

