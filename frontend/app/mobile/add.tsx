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
import { authService } from '../../services/authService';
import { LAN_HOST, PORT } from '../../constants/api';

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

  // 1. Chọn ảnh từ Thư viện (Gallery)
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Quyền truy cập',
          'Ứng dụng cần được cấp quyền truy cập thư viện ảnh để tải lên hình ảnh sản phẩm.'
        );
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

  // 2. Chụp ảnh trực tiếp từ Camera
  const handleCaptureFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Quyền máy ảnh',
          'Ứng dụng cần được cấp quyền sử dụng camera để chụp hình sản phẩm.'
        );
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

  // 3. Tải ảnh lên Backend Multer (/api/upload)
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
        // Cú pháp file upload tương thích React Native Android / iOS
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
      setError(
        err.response?.data?.message ||
        `Lỗi khi tải ảnh lên Backend (${LAN_HOST}:${PORT}). Vui lòng kiểm tra lại kết nối mạng.`
      );
    } finally {
      setUploading(false);
    }
  };

  // 4. Lưu sản phẩm vào MongoDB
  const handleSaveProduct = async () => {
    // Validation
    if (!name.trim()) {
      setError('Tên sản phẩm không được để trống.');
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
      setError('Vui lòng chọn hình ảnh từ thư viện hoặc chụp ảnh trước khi lưu.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Chỉ gửi đúng 4 trường được phép theo đề bài: name, price, soluong, image
      const payload = {
        name: name.trim(),
        price: numPrice,
        soluong: numSoluong,
        image: image.trim(),
      };

      const res = await productService.createProduct(payload);

      if (res.success) {
        setSuccess(`✅ Đã thêm sản phẩm "${res.data.name}" vào MongoDB thành công!`);
        setTimeout(() => {
          router.replace('/mobile' as any);
        }, 1200);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Không thể lưu sản phẩm. Vui lòng kiểm tra kết nối Backend và thử lại.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Sản Phẩm (Mobile)</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formTitle}>Nhập Thông Tin Sản Phẩm</Text>
        <Text style={styles.formSubtitle}>
          Dữ liệu sẽ được lưu trực tiếp vào collection `products` trong MongoDB
        </Text>

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

        {/* Form fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Tên sản phẩm <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Tai nghe Sony WH-1000XM5"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>
              Đơn giá (VND) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 8500000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>
              Số lượng <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 25"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={soluong}
              onChangeText={setSoluong}
            />
          </View>
        </View>

        {/* Chọn hình ảnh */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>
            Hình ảnh sản phẩm <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.imageTip}>
            Chọn ảnh từ thư viện thiết bị Android hoặc nhập đường dẫn ảnh:
          </Text>

          {/* Các nút chọn ảnh */}
          <View style={styles.imageActionRow}>
            <TouchableOpacity
              style={styles.pickBtn}
              onPress={handlePickFromGallery}
              disabled={uploading}
            >
              <Text style={styles.pickBtnText}>🖼️ Thư viện ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handleCaptureFromCamera}
              disabled={uploading}
            >
              <Text style={styles.cameraBtnText}>📷 Chụp ảnh</Text>
            </TouchableOpacity>
          </View>

          {/* Nhập URL ảnh thủ công */}
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Hoặc dán URL ảnh tại đây..."
            placeholderTextColor="#94a3b8"
            value={image}
            onChangeText={setImage}
          />

          {/* Loading khi đang upload */}
          {uploading && (
            <View style={styles.uploadingBox}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.uploadingText}>Đang tải hình ảnh lên Backend Multer...</Text>
            </View>
          )}

          {/* Preview hình ảnh */}
          {image ? (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Xem trước hình ảnh đã chọn:</Text>
              <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
              <Text style={styles.imageUrlText} numberOfLines={1}>
                {image}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Nút lưu sản phẩm */}
        <TouchableOpacity
          style={[styles.submitBtn, (saving || uploading) && styles.submitBtnDisabled]}
          onPress={handleSaveProduct}
          disabled={saving || uploading}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>💾 LƯU SẢN PHẨM VÀO MONGODB</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
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
  successBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  imageSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  imageTip: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pickBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cameraBtn: {
    flex: 1,
    backgroundColor: '#475569',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  uploadingText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  previewBox: {
    marginTop: 14,
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
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  imageUrlText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
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

