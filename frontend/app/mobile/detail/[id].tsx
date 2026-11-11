import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productService } from '../../../services/productService';
import { Product } from '../../../types/product';

export default function MobileProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await productService.getProductById(id);
        if (res.success) {
          setProduct(res.data);
        } else {
          setError('Không tìm thấy thông tin sản phẩm.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi tải chi tiết sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Sản Phẩm</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang nạp chi tiết từ MongoDB...</Text>
        </View>
      ) : error || !product ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Không tìm thấy sản phẩm'}</Text>
          <TouchableOpacity style={styles.backActionBtn} onPress={() => router.back()}>
            <Text style={styles.backActionText}>Về danh sách</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Ảnh lớn */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.image }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Chi tiết nội dung */}
          <View style={styles.infoCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{formatVND(product.price)}</Text>

            <View style={styles.divider} />

            {/* Các trường thông tin */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📦 Số lượng tồn kho:</Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>{product.soluong} chiếc</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🆔 MongoDB _id:</Text>
              <Text style={styles.idText}>{product._id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💾 Cơ sở dữ liệu:</Text>
              <Text style={styles.dbText}>ProductManagement (products)</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🌐 Đường dẫn ảnh:</Text>
              <Text style={styles.imagePathText} numberOfLines={2}>
                {product.image}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Tổng giá trị hàng của mẫu này */}
            <View style={styles.totalValueBox}>
              <Text style={styles.totalValueLabel}>Tổng giá trị tồn kho mặt hàng này:</Text>
              <Text style={styles.totalValueNumber}>
                {formatVND(product.price * product.soluong)}
              </Text>
            </View>

            {/* Nút hành động */}
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.backListBtn}
                onPress={() => router.push('/mobile' as any)}
              >
                <Text style={styles.backListBtnText}>← Xem danh sách sản phẩm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
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
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  heroImage: {
    width: '90%',
    height: 260,
    borderRadius: 12,
  },
  infoCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 40,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563eb',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  stockBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  stockText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },
  idText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#334155',
    fontWeight: '600',
  },
  dbText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  imagePathText: {
    fontSize: 11,
    color: '#94a3b8',
    maxWidth: '65%',
  },
  totalValueBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalValueLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  totalValueNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  actionBtns: {
    gap: 10,
  },
  backListBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  backListBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 15,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  backActionBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

