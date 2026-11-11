import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
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

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (Math.min(width, 600) - 24) / 2;

export default function MobileHomeScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = keyword && keyword.trim() ? { search: keyword.trim() } : undefined;
      const res = await productService.getProducts(params);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err: any) {
      setError('Không thể kết nối máy chủ. Vui lòng kiểm tra lại mạng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchProducts(text);
  };

  const formatVND = (num: number) => {
    return '₫' + new Intl.NumberFormat('vi-VN').format(num);
  };

  const renderShopeeProduct = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        { marginRight: index % 2 === 0 ? 8 : 0 },
      ]}
      activeOpacity={0.9}
      onPress={() => router.push(`/mobile/detail/${item._id}` as any)}
    >
      {/* Ảnh sản phẩm */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {/* Badge Shopee Yêu thích / Mall */}
        <View style={styles.mallBadge}>
          <Text style={styles.mallBadgeText}>Yêu thích</Text>
        </View>
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.cardInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.tagRow}>
          <Text style={styles.freeshipTag}>Freeship Xtra</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatVND(item.price)}</Text>
          <Text style={styles.stockText}>Kho: {item.soluong}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header Shopee Orange */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Shopee tìm kiếm..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Nút Kênh Quản lý */}
        <TouchableOpacity
          style={styles.sellerBtn}
          onPress={() => router.push('/admin/products' as any)}
        >
          <Text style={styles.sellerBtnIcon}>🏪</Text>
          <Text style={styles.sellerBtnText}>Quản lý</Text>
        </TouchableOpacity>
      </View>

      {/* Thanh danh mục / khuyến mãi Shopee */}
      <View style={styles.bannerStrip}>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerIcon}>🚚</Text>
          <Text style={styles.bannerText}>Freeship 0Đ</Text>
        </View>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerIcon}>⚡</Text>
          <Text style={styles.bannerText}>Flash Sale</Text>
        </View>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerIcon}>🏷️</Text>
          <Text style={styles.bannerText}>Shopee Mall</Text>
        </View>
        <TouchableOpacity 
          style={styles.bannerItem}
          onPress={() => router.push('/mobile/add' as any)}
        >
          <Text style={styles.bannerIcon}>➕</Text>
          <Text style={[styles.bannerText, { color: '#ee4d2d', fontWeight: '700' }]}>Đăng bán</Text>
        </TouchableOpacity>
      </View>

      {/* Tiêu đề mục GỢI Ý HÔM NAY */}
      <View style={styles.sectionHeader}>
        <View style={styles.orangeLine} />
        <Text style={styles.sectionTitle}>GỢI Ý HÔM NAY</Text>
        <View style={styles.orangeLine} />
      </View>

      {/* Lưới 2 cột sản phẩm */}
      {error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProducts()}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#ee4d2d" />
          <Text style={styles.loadingText}>Đang nạp sản phẩm Shopee...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={renderShopeeProduct}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchProducts(search);
              }}
              colors={['#ee4d2d']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            </View>
          }
        />
      )}

      {/* Nút nổi Đăng Bán Sản Phẩm (Shopee Seller FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/mobile/add' as any)}
      >
        <Text style={styles.fabIcon}>➕</Text>
        <Text style={styles.fabText}>Thêm SP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Shopee Background
  },
  header: {
    backgroundColor: '#ee4d2d', // Shopee Orange
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#222222',
    paddingVertical: 4,
  },
  clearSearch: {
    fontSize: 14,
    color: '#999',
    padding: 4,
  },
  sellerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  sellerBtnIcon: {
    fontSize: 18,
  },
  sellerBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  bannerStrip: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bannerItem: {
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  bannerText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  orangeLine: {
    width: 30,
    height: 2,
    backgroundColor: '#ee4d2d',
  },
  sectionTitle: {
    color: '#ee4d2d',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#fafafa',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  mallBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: 4,
  },
  mallBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  cardInfo: {
    padding: 8,
    justifyContent: 'space-between',
    minHeight: 85,
  },
  productName: {
    fontSize: 13,
    color: '#222222',
    lineHeight: 17,
    fontWeight: '500',
  },
  tagRow: {
    marginVertical: 4,
  },
  freeshipTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#eafbf3',
    color: '#00bfa5',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#00bfa5',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ee4d2d', // Shopee Red Orange Price
  },
  stockText: {
    fontSize: 10,
    color: '#888888',
  },
  centerBox: {
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
    color: '#ee4d2d',
    fontSize: 13,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#777',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    backgroundColor: '#ee4d2d',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#ee4d2d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fabText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
