import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';
import { getProductImageUri } from '../../utils/imageHelper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (Math.min(width, 600) - 40) / 2;

export default function MobileProductCatalogScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchProducts = async (sort?: string) => {
    try {
      setLoading(true);
      const params = sort ? { sort } : undefined;
      const res = await productService.getProducts(params);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err: any) {
      console.warn('Error fetching products:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilterPress = (filterKey: string, sortVal?: string) => {
    setActiveFilter(filterKey);
    fetchProducts(sortVal);
  };

  const formatVND = (num: number) => {
    if (num === 0) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const renderProductCard = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        { marginRight: index % 2 === 0 ? 12 : 0 },
      ]}
      activeOpacity={0.9}
      onPress={() => router.push(`/mobile/detail/${item._id}` as any)}
    >
      {/* Khung ảnh có bo góc bên trong card */}
      <View style={styles.cardImageWrapper}>
        <Image
          source={{ uri: getProductImageUri(item.image, item.name) }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        {/* Huy hiệu góc phải */}
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>CHÍNH HÃNG</Text>
        </View>
      </View>

      {/* Tên sản phẩm */}
      <Text style={styles.productTitle} numberOfLines={1}>
        {item.name}
      </Text>

      {/* Thời gian / Số lượng tồn kho giống 'Pick up by 8:30 PM' */}
      <Text style={styles.productMeta}>
        Kho: {item.soluong} sản phẩm có sẵn
      </Text>

      {/* Dòng dưới: Giá tiền bên trái & Nút Claim/Xem bên phải */}
      <View style={styles.cardBottomRow}>
        <Text style={styles.productPrice}>{formatVND(item.price)}</Text>
        <TouchableOpacity
          style={styles.claimButton}
          activeOpacity={0.85}
          onPress={() => router.push(`/mobile/detail/${item._id}` as any)}
        >
          <Text style={styles.claimButtonText}>Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header chuẩn: Nút tròn Back < | Tiêu đề giữa | Nút tròn ... */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circularBtn} onPress={() => router.push('/admin/products' as any)}>
          <Text style={styles.circularBtnIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Quản Lý Bán Hàng</Text>

        <TouchableOpacity 
          style={styles.circularBtn} 
          onPress={() => router.push('/admin/products' as any)}
        >
          <Text style={styles.circularBtnIcon}>🏪</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={renderProductCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProducts();
            }}
            colors={['#1b4332']}
          />
        }
        ListHeaderComponent={
          <>
            {/* Thẻ Hero Card trên cùng */}
            <View style={styles.topHeroCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80' }}
                style={styles.topHeroImage}
                resizeMode="cover"
              />
              <View style={styles.topHeroContent}>
                <Text style={styles.topHeroTag}>KHO HÀNG & BÁN HÀNG</Text>
                <Text style={styles.topHeroTitle}>Sản phẩm kinh doanh</Text>
                <Text style={styles.topHeroDesc}>
                  Hệ thống quản lý sản phẩm, tồn kho và đơn giá đồng bộ trực tiếp từ MongoDB.
                </Text>
              </View>
            </View>

            {/* Các nút lọc viên thuốc (Filter Pills) */}
            <View style={styles.filterPillsRow}>
              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
                onPress={() => handleFilterPress('all')}
              >
                <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}>
                  Tất cả
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'price_asc' && styles.filterPillActive]}
                onPress={() => handleFilterPress('price_asc', 'price_asc')}
              >
                <Text style={[styles.filterPillText, activeFilter === 'price_asc' && styles.filterPillTextActive]}>
                  Giá thấp
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'soluong_desc' && styles.filterPillActive]}
                onPress={() => handleFilterPress('soluong_desc', 'soluong_desc')}
              >
                <Text style={[styles.filterPillText, activeFilter === 'soluong_desc' && styles.filterPillTextActive]}>
                  Kho nhiều
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tiêu đề phân mục */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Sản phẩm trong kho</Text>
              <Text style={styles.sectionOfferCount}>{products.length} sản phẩm</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#1b4332" />
              <Text style={styles.loadingText}>Đang tải danh sách sản phẩm...</Text>
            </View>
          ) : (
            <View style={styles.centerBox}>
              <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            </View>
          )
        }
      />

      {/* Nút nổi thêm / tải ảnh sản phẩm lên hệ thống */}
      <TouchableOpacity
        style={styles.fabUploadBtn}
        activeOpacity={0.85}
        onPress={() => router.push('/mobile/add' as any)}
      >
        <Text style={styles.fabUploadIcon}>📷</Text>
        <Text style={styles.fabUploadText}>Tải ảnh lên</Text>
      </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  circularBtnIcon: {
    fontSize: 22,
    color: '#1b4332',
    fontWeight: '700',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1b4332',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 90,
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
  },
  topHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e8ece6',
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  topHeroImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#eef2ea',
  },
  topHeroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  topHeroTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1b4332',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  topHeroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 4,
  },
  topHeroDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterPillActive: {
    backgroundColor: '#1b4332', // Dark Green Active Pill
    borderColor: '#1b4332',
  },
  filterPillText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  sectionOfferCount: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  /* 2-Column Product Cards matching Image 2 */
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ece6',
    padding: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImageWrapper: {
    width: '100%',
    aspectRatio: 1.1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f6f8f5',
    marginBottom: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e6f4ea', // Light mint green badge
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#1b4332',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  claimButton: {
    backgroundColor: '#1b4332', // Deep green button
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  claimButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  fabUploadBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#1b4332',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabUploadIcon: {
    fontSize: 16,
  },
  fabUploadText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
