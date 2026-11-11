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
    return '₫' + new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header Shopee */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product ? product.name : 'Chi Tiết Sản Phẩm'}
        </Text>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/mobile' as any)}>
          <Text style={styles.homeBtnText}>🏠</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ee4d2d" />
          <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
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
            {/* Ảnh lớn Hero Image Shopee Style */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: product.image }}
                style={styles.heroImage}
                resizeMode="contain"
              />
              <View style={styles.mallBadge}>
                <Text style={styles.mallBadgeText}>Shopee Mall</Text>
              </View>
            </View>

            {/* Khối giá & tên sản phẩm */}
            <View style={styles.sectionCard}>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>{formatVND(product.price)}</Text>
                <View style={styles.cheapTag}>
                  <Text style={styles.cheapTagText}>₫ Gì Cũng Rẻ</Text>
                </View>
              </View>

              <Text style={styles.productName}>{product.name}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.starText}>⭐⭐⭐⭐⭐ 5.0</Text>
                <Text style={styles.dividerDot}>•</Text>
                <Text style={styles.stockInfoText}>Kho: {product.soluong} sản phẩm</Text>
                <Text style={styles.dividerDot}>•</Text>
                <Text style={styles.soldText}>Chính hãng 100%</Text>
              </View>
            </View>

            {/* Dịch vụ & Ưu đãi Shopee */}
            <View style={styles.sectionCard}>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceIcon}>🚚</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>Miễn phí vận chuyển</Text>
                  <Text style={styles.serviceSub}>Miễn phí vận chuyển cho đơn hàng từ 0Đ</Text>
                </View>
              </View>

              <View style={styles.serviceDivider} />

              <View style={styles.serviceRow}>
                <Text style={styles.serviceIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>Shopee Đảm Bảo</Text>
                  <Text style={styles.serviceSub}>Trả hàng miễn phí trong 15 ngày</Text>
                </View>
              </View>
            </View>

            {/* Chi tiết sản phẩm */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeading}>Chi Tiết Sản Phẩm</Text>
              
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Danh Mục</Text>
                <Text style={styles.specValue}>Shopee &gt; Thiết Bị Điện Tử</Text>
              </View>
              
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Số Lượng Tồn</Text>
                <Text style={[styles.specValue, { color: '#ee4d2d', fontWeight: '700' }]}>
                  {product.soluong} sản phẩm có sẵn
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Tình Trạng</Text>
                <Text style={styles.specValue}>Mới 100% nguyên seal</Text>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Gửi Từ</Text>
                <Text style={styles.specValue}>Hà Nội / TP. Hồ Chí Minh</Text>
              </View>
            </View>
          </ScrollView>

          {/* Thanh tác vụ cố định bên dưới (Shopee Bottom Bar) */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.chatBtn}
              onPress={() => router.push('/admin/products' as any)}
            >
              <Text style={styles.bottomIcon}>🏪</Text>
              <Text style={styles.bottomIconLabel}>Quản lý</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cartBtn}
              onPress={() => router.push('/mobile/add' as any)}
            >
              <Text style={styles.bottomIcon}>➕</Text>
              <Text style={styles.bottomIconLabel}>Thêm SP</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buyBtn}
              onPress={() => router.push('/mobile' as any)}
            >
              <Text style={styles.buyBtnText}>Xem Thêm Sản Phẩm</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  backBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ee4d2d',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
    maxWidth: width - 100,
  },
  homeBtn: {
    padding: 4,
  },
  homeBtnText: {
    fontSize: 18,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    height: 320,
    width: '100%',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  mallBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  mallBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ee4d2d', // Shopee Signature Red Orange
  },
  cheapTag: {
    backgroundColor: '#ffefe9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#ee4d2d',
  },
  cheapTagText: {
    color: '#ee4d2d',
    fontSize: 10,
    fontWeight: '700',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    lineHeight: 22,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starText: {
    fontSize: 12,
    color: '#ffaa00',
    fontWeight: '600',
  },
  dividerDot: {
    color: '#ccc',
    fontSize: 12,
  },
  stockInfoText: {
    fontSize: 12,
    color: '#555',
  },
  soldText: {
    fontSize: 12,
    color: '#00bfa5',
    fontWeight: '600',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  serviceIcon: {
    fontSize: 18,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },
  serviceSub: {
    fontSize: 11,
    color: '#777',
    marginTop: 1,
  },
  serviceDivider: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginVertical: 8,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
  },
  specLabel: {
    width: 120,
    fontSize: 12,
    color: '#757575',
  },
  specValue: {
    flex: 1,
    fontSize: 12,
    color: '#222222',
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    height: 52,
  },
  chatBtn: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f5f5f5',
  },
  cartBtn: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f5f5f5',
  },
  bottomIcon: {
    fontSize: 16,
  },
  bottomIconLabel: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
    fontWeight: '600',
  },
  buyBtn: {
    flex: 1,
    backgroundColor: '#ee4d2d', // Shopee Orange Action
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#777',
  },
  errorText: {
    fontSize: 14,
    color: '#ee4d2d',
    marginBottom: 12,
  },
  backActionBtn: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
