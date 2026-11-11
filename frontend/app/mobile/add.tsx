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

  // 1. Chọn ảnh từ Thư viện
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
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

  // 2. Chụp ảnh từ Camera
  const handleCaptureFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền máy ảnh', 'Vui lòng cấp quyền truy cập camera.');
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

  // 3. Tải ảnh lên Server
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
        setError('Không nhận được link ảnh từ máy chủ.');
      }
    } catch (err: any) {
      setError('Lỗi khi tải ảnh. Vui lòng kiểm tra kết nối mạng.');
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
      setError('Giá sản phẩm không hợp lệ.');
      return;
    }

    const numSoluong = Number(soluong);
    if (soluong.trim() === '' || isNaN(numSoluong) || numSoluong < 0) {
      setError('Số lượng kho không hợp lệ.');
      return;
    }

    if (!image.trim()) {
      setError('Vui lòng chọn hình ảnh sản phẩm.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Chỉ gửi đúng 4 trường: name, price, soluong, image
      const payload = {
        name: name.trim(),
        price: numPrice,
        soluong: numSoluong,
        image: image.trim(),
      };

      const res = await productService.createProduct(payload);

      if (res.success) {
        setSuccess(`Đã đăng bán "${res.data.name}" thành công!`);
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
      <StatusBar style="light" />

      {/* Header Shopee Orange */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng Bán Sản Phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Thông báo lỗi / thành công */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ {success}</Text>
          </View>
        )}

        {/* Khối chọn hình ảnh Shopee Style */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Hình ảnh sản phẩm *</Text>
          <Text style={styles.imageTip}>Tải ảnh thật của sản phẩm để người mua dễ nhận biết</Text>

          <View style={styles.photoRow}>
            {/* Hộp chọn từ Thư viện */}
            <TouchableOpacity
              style={styles.photoUploadBox}
              onPress={handlePickFromGallery}
              disabled={uploading}
            >
              <Text style={styles.photoUploadIcon}>🖼️</Text>
              <Text style={styles.photoUploadLabel}>Thư viện</Text>
            </TouchableOpacity>

            {/* Hộp chụp ảnh từ Camera */}
            <TouchableOpacity
              style={styles.photoUploadBox}
              onPress={handleCaptureFromCamera}
              disabled={uploading}
            >
              <Text style={styles.photoUploadIcon}>📷</Text>
              <Text style={styles.photoUploadLabel}>Chụp ảnh</Text>
            </TouchableOpacity>

            {/* Xem trước ảnh nếu có */}
            {image ? (
              <View style={styles.photoPreviewBox}>
                <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.checkedBadge}>
                  <Text style={styles.checkedText}>✓</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Nhập link ảnh thủ công nếu cần */}
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Hoặc dán URL hình ảnh tại đây..."
            placeholderTextColor="#999"
            value={image}
            onChangeText={setImage}
          />

          {uploading && (
            <View style={styles.uploadingBox}>
              <ActivityIndicator size="small" color="#ee4d2d" />
              <Text style={styles.uploadingText}>Đang tải ảnh lên...</Text>
            </View>
          )}
        </View>

        {/* Thông tin cơ bản Shopee Style */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Thông tin cơ bản</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tên sản phẩm *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: iPhone 16 Pro Max 256GB"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Giá bán (₫) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Kho hàng *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={soluong}
                onChangeText={setSoluong}
              />
            </View>
          </View>
        </View>

        {/* Nút đăng bán Shopee Orange */}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ee4d2d', // Shopee Orange
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
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
    padding: 12,
    paddingBottom: 40,
  },
  cardSection: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  imageTip: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  photoUploadBox: {
    width: 80,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ee4d2d',
    backgroundColor: '#fffcfb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUploadIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  photoUploadLabel: {
    fontSize: 11,
    color: '#ee4d2d',
    fontWeight: '600',
  },
  photoPreviewBox: {
    width: 80,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  checkedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#00bfa5',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fff5f3',
    borderRadius: 4,
  },
  uploadingText: {
    fontSize: 12,
    color: '#ee4d2d',
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 12,
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
  errorBox: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffc2c2',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#ee4d2d',
    fontSize: 13,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: '#e6f7ec',
    borderWidth: 1,
    borderColor: '#a3e6b7',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  successText: {
    color: '#12873b',
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#ee4d2d', // Shopee Signature Orange
    paddingVertical: 13,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ee4d2d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#f5a897',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
