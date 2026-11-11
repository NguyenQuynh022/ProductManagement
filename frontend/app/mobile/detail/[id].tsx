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
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productService } from '../../../services/productService';
import { Product } from '../../../types/product';

const { width } = Dimensions.get('window');

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
          setError('Không tìm thấy sản phẩm.');
        }
      } catch (err: any) {
        setError('Lỗi khi tải thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const formatVND = (num: number) => {
    if (num === 0) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header với 2 nút tròn chuẩn ResQ */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circularBtn} onPress={() => router.back()}>
          <Text style={styles.circularBtnIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Sản Phẩm</Text>
        <TouchableOpacity style={styles.circularBtn} onPress={() => router.push('/mobile' as any)}>
          <Text style={styles.circularBtnIcon}>🏠</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1b4332" />
          <Text style={styles.loadingText}>Đang nạp chi tiết sản phẩm...</Text>
        </View>
      ) : error || !product ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Không tìm thấy sản phẩm'}</Text>
          <TouchableOpacity style={styles.backActionBtn} onPress={() => router.back()}>
            <Text style={styles.backActionText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Ảnh lớn bo góc đẹp */}
            <View style={styles.imageCard}>
              <Image
                source={{ uri: product.image }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>CHÍNH HÃNG</Text>
              </View>
            </View>

            {/* Khối thông tin chi tiết */}
            <View style={styles.infoCard}>
              <View style={styles.titlePriceRow}>
                <Text style={styles.productTitle}>{product.name}</Text>
                <Text style={styles.productPrice}>{formatVND(product.price)}</Text>
              </View>

              <View style={styles.badgeRow}>
                <View style={styles.mintPill}>
                  <Text style={styles.mintPillText}>Còn {product.soluong} sản phẩm</Text>
                </View>
                <View style={styles.mintPill}>
                  <Text style={styles.mintPillText}>Chất lượng cao</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionHeading}>Mô tả &amp; Thông tin</Text>
              <Text style={styles.descriptionText}>
                Sản phẩm được bảo quản trong tình trạng hoàn hảo. Toàn bộ thông tin được cập nhật và đồng bộ trực tiếp từ hệ thống.
              </Text>

              <View style={styles.specsGrid}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Tình trạng</Text>
                  <Text style={styles.specValue}>Mới 100%</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Kho khả dụng</Text>
                  <Text style={styles.specValue}>{product.soluong} chiếc</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Thanh cố định bên dưới với nút Claim / Hành động chuẩn ResQ */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.manageBtn}
              onPress={() => router.push('/admin/products' as any)}
            >
              <Text style={styles.manageBtnText}>🏪 Quản lý</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => router.push('/mobile/add' as any)}
            >
              <Text style={styles.actionBtnText}>📷 Tải ảnh &amp; Thêm SP</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  imageCard: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f6f8f5',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#1b4332',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e8ece6',
    padding: 20,
    marginTop: 10,
  },
  titlePriceRow: {
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1b4332', // Forest Green
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  mintPill: {
    backgroundColor: '#f1f6f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mintPillText: {
    color: '#1b4332',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#eef2ea',
    marginVertical: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  specItem: {
    flex: 1,
    backgroundColor: '#f8faf7',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  specLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8ece6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  manageBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e8ece6',
    backgroundColor: '#f8faf7',
  },
  manageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b4332',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1b4332',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 13,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginBottom: 12,
  },
  backActionBtn: {
    backgroundColor: '#1b4332',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
