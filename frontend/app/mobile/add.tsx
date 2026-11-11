import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { productService } from '../../services/productService';

export default function MobileAddProductScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [soluong, setSoluong] = useState('');
  const [image, setImage] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Chọn ảnh từ Thư viện ảnh
  const handlePickFromGallery = async () => {
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
        await uploadSelectedImage(result.assets[0].uri);
      }
    } catch (err: any) {
      setError('Lỗi khi mở thư viện ảnh: ' + err.message);
    }
  };

  // 2. Chụp ảnh mới từ Camera
  const handleCaptureFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền máy ảnh', 'Vui lòng cấp quyền máy ảnh để chụp hình sản phẩm.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadSelectedImage(result.assets[0].uri);
      }
    } catch (err: any) {
      setError('Lỗi khi mở camera: ' + err.message);
    }
  };

  // 3. Tải ảnh lên Backend Multer
  const uploadSelectedImage = async (uri: string) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      const filename = uri.split('/').pop() || `photo-${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

      if (Platform.OS === 'web') {
        const fetchRes = await fetch(uri);
        const blob = await fetchRes.blob();
        formData.append('image', blob, filename);
      } else {
        formData.append('image', {
          uri: uri,
          name: filename,
          type: type,
        } as any);
      }

      const uploadRes = await productService.uploadImage(formData);
      if (uploadRes.success && uploadRes.image) {
        setImage(uploadRes.image);
      } else {
        setError('Không nhận được đường dẫn ảnh từ máy chủ.');
      }
    } catch (err: any) {
      setError('Lỗi khi tải ảnh lên máy chủ. Hãy kiểm tra kết nối mạng.');
    } finally {
      setUploading(false);
    }
  };

  // 4. Lưu sản phẩm
  const handleSaveProduct = async () => {
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
      setError('Số lượng sản phẩm không hợp lệ.');
      return;
    }

    if (!image.trim()) {
      setError('Vui lòng chọn hoặc chụp ảnh sản phẩm trước khi lưu.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Đúng 4 trường: name, price, soluong, image
      const payload = {
        name: name.trim(),
        price: numPrice,
        soluong: numSoluong,
        image: image.trim(),
      };

      const res = await productService.createProduct(payload);

      if (res.success) {
        setSuccess(`✅ Đã đăng sản phẩm "${res.data.name}" thành công!`);
        setTimeout(() => {
          router.replace('/mobile' as any);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lưu sản phẩm. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header chuẩn ResQ với nút tròn */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circularBtn} onPress={() => router.back()}>
          <Text style={styles.circularBtnIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng Bán Sản Phẩm</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Thông báo lỗi / thành công */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        {/* Khối tải ảnh nổi bật chuẩn phong cách ResQ */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Hình ảnh sản phẩm</Text>
          <Text style={styles.sectionDesc}>Tải lên hình ảnh rõ nét từ máy ảnh hoặc thư viện</Text>

          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={handlePickFromGallery}
                disabled={uploading}
              >
                <Text style={styles.changePhotoText}>Đổi ảnh khác</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPlaceholderCard}>
              <Text style={styles.uploadMainIcon}>📸</Text>
              <Text style={styles.uploadMainTitle}>Chưa có hình ảnh nào</Text>
              <Text style={styles.uploadMainDesc}>Chọn một trong hai cách dưới đây để tải ảnh lên:</Text>

              <View style={styles.uploadActionButtons}>
                <TouchableOpacity
                  style={styles.uploadPillBtn}
                  onPress={handlePickFromGallery}
                  disabled={uploading}
                >
                  <Text style={styles.uploadPillIcon}>🖼️</Text>
                  <Text style={styles.uploadPillText}>Thư viện ảnh</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.uploadPillBtn, styles.uploadPillBtnSecondary]}
                  onPress={handleCaptureFromCamera}
                  disabled={uploading}
                >
                  <Text style={styles.uploadPillIcon}>📷</Text>
                  <Text style={[styles.uploadPillText, { color: '#1b4332' }]}>Chụp ảnh mới</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Ô dán URL ảnh dự phòng */}
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Hoặc dán URL hình ảnh trực tiếp tại đây..."
            placeholderTextColor="#9ca3af"
            value={image}
            onChangeText={setImage}
          />

          {uploading && (
            <View style={styles.uploadingBox}>
              <ActivityIndicator size="small" color="#1b4332" />
              <Text style={styles.uploadingText}>Đang tải hình ảnh lên máy chủ...</Text>
            </View>
          )}
        </View>

        {/* Khối thông tin chi tiết */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Thông tin cơ bản</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tên sản phẩm *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Cơm hộp rau củ, iPhone 16..."
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Đơn giá (VND) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Số lượng tồn *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={soluong}
                onChangeText={setSoluong}
              />
            </View>
          </View>
        </View>

        {/* Nút lưu sản phẩm chuẩn ResQ */}
        <TouchableOpacity
          style={[styles.submitBtn, (saving || uploading) && styles.submitBtnDisabled]}
          onPress={handleSaveProduct}
          disabled={saving || uploading}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>ĐĂNG BÁN SẢN PHẨM</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  circularBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e8ece6',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularBtnIcon: {
    fontSize: 22,
    color: '#1b4332',
    fontWeight: '700',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1b4332',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  cardSection: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e8ece6',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 14,
  },
  uploadPlaceholderCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#1b4332',
    backgroundColor: '#f7faf6',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadMainIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  uploadMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1b4332',
    marginBottom: 4,
  },
  uploadMainDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadActionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadPillBtn: {
    backgroundColor: '#1b4332',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadPillBtnSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1b4332',
  },
  uploadPillIcon: {
    fontSize: 14,
  },
  uploadPillText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: '#f8faf7',
  },
  changePhotoBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f6f1',
    borderRadius: 16,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1b4332',
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f1f6f1',
    borderRadius: 12,
  },
  uploadingText: {
    fontSize: 13,
    color: '#1b4332',
    fontWeight: '600',
  },
  fieldGroup: {
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#1b4332', // Deep Forest Green
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
