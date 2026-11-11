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
        Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh.');
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
      setError('Vui lòng tải ảnh sản phẩm.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Chỉ gửi 4 trường: name, price, soluong, image
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
          {/* Header Shopee Seller */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEdit ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
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

            {/* Chọn hình ảnh Shopee Style */}
            <View style={styles.imageSection}>
              <Text style={styles.label}>Hình ảnh sản phẩm *</Text>
              
              <View style={styles.imageUploadRow}>
                <TouchableOpacity
                  style={styles.imagePickerBox}
                  onPress={handleNativeImagePick}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#ee4d2d" />
                  ) : (
                    <>
                      <Text style={styles.cameraIcon}>📷</Text>
                      <Text style={styles.imagePickerText}>
                        {image ? 'Đổi ảnh' : '+ Thêm ảnh'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {image ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
                  </View>
                ) : null}
              </View>

              {/* Input URL ảnh thủ công */}
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={image}
                onChangeText={setImage}
                placeholder="Hoặc dán URL hình ảnh..."
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
              />
            </View>

            {/* Đơn giá và Số lượng kho */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Giá bán (₫) *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Kho hàng *</Text>
                <TextInput
                  style={styles.input}
                  value={soluong}
                  onChangeText={setSoluong}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer buttons Shopee style */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 18,
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffc2c2',
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#ee4d2d',
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
    width: 80,
    height: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ee4d2d',
    borderRadius: 4,
    backgroundColor: '#fffcfb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 22,
  },
  imagePickerText: {
    fontSize: 11,
    color: '#ee4d2d',
    fontWeight: '600',
    marginTop: 4,
  },
  previewBox: {
    width: 80,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#222',
    backgroundColor: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#ee4d2d', // Shopee Orange
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#f5a897',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
