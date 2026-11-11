import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Product } from '../types/product';
import { productService } from '../services/productService';

interface ProductFormModalProps {
  visible: boolean;
  product?: Product | null;
  onClose: () => void;
  onSuccess: (savedProduct: Product, isEdit: boolean) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  product,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!product;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [soluong, setSoluong] = useState('');
  const [image, setImage] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setSoluong(String(product.soluong));
      setImage(product.image);
    } else {
      setName('');
      setPrice('');
      setSoluong('');
      setImage('');
    }
    setError(null);
  }, [product, visible]);

  // Xử lý chọn file ảnh từ máy tính (hỗ trợ Web và Mobile)
  const handlePickFileWeb = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const res = await productService.uploadImage(formData);
      if (res.success && res.image) {
        setImage(res.image);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi tải ảnh lên server');
    } finally {
      setUploading(false);
    }
  };

  const handleNativeImagePick = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.getElementById('web-file-input') as HTMLInputElement;
      if (input) input.click();
    }
  };

  const handleSubmit = async () => {
    // 1. Validation
    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm.');
      return;
    }

    const numPrice = Number(price);
    if (price.trim() === '' || isNaN(numPrice) || numPrice < 0) {
      setError('Giá sản phẩm phải là một số không âm.');
      return;
    }

    const numSoluong = Number(soluong);
    if (soluong.trim() === '' || isNaN(numSoluong) || numSoluong < 0) {
      setError('Số lượng sản phẩm phải là một số không âm.');
      return;
    }

    if (!image.trim()) {
      setError('Vui lòng nhập link ảnh hoặc tải ảnh từ máy tính.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Đảm bảo chỉ gửi đúng 4 trường theo quy định đề bài: name, price, soluong, image
      const payload = {
        name: name.trim(),
        price: numPrice,
        soluong: numSoluong,
        image: image.trim(),
      };

      let res;
      if (isEdit && product) {
        res = await productService.updateProduct(product._id, payload);
      } else {
        res = await productService.createProduct(payload);
      }

      if (res.success) {
        onSuccess(res.data, isEdit);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu sản phẩm. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEdit ? '✏️ Chỉnh Sửa Sản Phẩm' : '➕ Thêm Sản Phẩm Mới'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Tên sản phẩm */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Tên sản phẩm <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ví dụ: iPhone 16 Pro Max"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Hàng: Giá và Số lượng */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  Đơn giá (VND) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="22000000"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  Số lượng tồn kho <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={soluong}
                  onChangeText={setSoluong}
                  placeholder="10"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Hình ảnh */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Hình ảnh sản phẩm <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.imageInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={image}
                  onChangeText={setImage}
                  placeholder="Nhập đường dẫn URL ảnh hoặc bấm Tải ảnh"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={handleNativeImagePick}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.uploadBtnText}>📁 Chọn ảnh</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Ẩn file input phục vụ Web */}
              {Platform.OS === 'web' && (
                <input
                  id="web-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePickFileWeb}
                />
              )}

              {/* Xem trước ảnh */}
              {image ? (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Xem trước hình ảnh:</Text>
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting || uploading}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitText}>
                  {isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  imageInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  uploadBtn: {
    backgroundColor: '#475569',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
  },
  uploadBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  cancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  submitBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});

