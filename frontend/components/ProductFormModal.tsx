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
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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

  // Web file input
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

  // Android/iOS: expo-image-picker
  const handlePickImageNative = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải ảnh lên.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const filename = uri.split('/').pop() || `photo-${Date.now()}.jpg`;
        const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        try {
          setUploading(true);
          setError(null);
          const formData = new FormData();
          formData.append('image', { uri, name: filename, type: mimeType } as any);
          const res = await productService.uploadImage(formData);
          if (res.success && res.image) {
            setImage(res.image);
          } else {
            setError('Không nhận được link ảnh từ máy chủ.');
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Lỗi tải ảnh lên server');
        } finally {
          setUploading(false);
        }
      }
    } catch (err: any) {
      setError('Lỗi khi mở thư viện ảnh: ' + err.message);
    }
  };

  const handleNativeImagePick = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.getElementById('web-file-input') as HTMLInputElement;
      if (input) {
        input.value = '';
        input.click();
      }
    } else {
      handlePickImageNative();
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm.');
      return;
    }

    const numPrice = Number(price);
    if (price.trim() === '' || isNaN(numPrice) || numPrice < 0) {
      setError('Giá sản phẩm không hợp lệ.');
      return;
    }

    const numSoluong = Number(soluong);
    if (soluong.trim() === '' || isNaN(numSoluong) || numSoluong < 0) {
      setError('Số lượng kho không hợp lệ.');
      return;
    }

    if (!image.trim()) {
      setError('Vui lòng tải hoặc chọn ảnh sản phẩm.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Chỉ gửi đúng 4 trường: name, price, soluong, image
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
      setError(err.response?.data?.message || 'Lỗi khi lưu sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header ResQ style */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEdit ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.circularCloseBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Khung tải ảnh */}
            <View style={styles.imageSection}>
              <Text style={styles.label}>Hình ảnh sản phẩm *</Text>
              
              <View style={styles.imageUploadRow}>
                <TouchableOpacity
                  style={styles.imagePickerBox}
                  onPress={handleNativeImagePick}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#1b4332" />
                  ) : (
                    <>
                      <Text style={styles.cameraIcon}>📷</Text>
                      <Text style={styles.imagePickerText}>
                        {image ? 'Đổi ảnh' : 'Tải ảnh lên'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {image ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                  </View>
                ) : null}
              </View>

              {/* Input URL ảnh thủ công */}
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                value={image}
                onChangeText={setImage}
                placeholder="Hoặc dán URL hình ảnh..."
                placeholderTextColor="#9ca3af"
              />

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
            </View>

            {/* Tên sản phẩm */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên sản phẩm..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Đơn giá và Số lượng kho */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Đơn giá (VND) *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Số lượng tồn *</Text>
                <TextInput
                  style={styles.input}
                  value={soluong}
                  onChangeText={setSoluong}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer buttons ResQ style */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isEdit ? 'Lưu thay đổi' : 'Hoàn thành'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e8ece6',
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1b4332',
  },
  circularCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  imageSection: {
    marginBottom: 14,
  },
  imageUploadRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  imagePickerBox: {
    width: 86,
    height: 86,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#1b4332',
    borderRadius: 16,
    backgroundColor: '#f7faf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 24,
  },
  imagePickerText: {
    fontSize: 11,
    color: '#1b4332',
    fontWeight: '700',
    marginTop: 4,
  },
  previewBox: {
    width: 86,
    height: 86,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8ece6',
    backgroundColor: '#f8faf7',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  formGroup: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fafcfa',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#1b4332', // Deep Green
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  submitBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
