import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Navbar } from '../../components/Navbar';
import { StatCard } from '../../components/StatCard';
import { productService } from '../../services/productService';
import { authService } from '../../services/authService';
import { Product } from '../../types/product';
import { getProductImageUri } from '../../utils/imageHelper';

export default function DashboardScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState('Quản lý');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        router.replace('/login');
        return;
      }

      const user = await authService.getCurrentUser();
      if (user) setAdminName(user.username);

      const res = await productService.getProducts();
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        await authService.logout();
        router.replace('/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + (Number(p.soluong) || 0), 0);
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.soluong) || 0),
    0
  );
  const maxPriceProduct = products.length > 0
    ? [...products].sort((a, b) => b.price - a.price)[0]
    : null;

  const formatVND = (num: number) => {
    if (num === 0) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  return (
    <View style={styles.container}>
      <Navbar username={adminName} productCount={products.length} />

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchDashboardData(); }}
            colors={['#1b4332']}
          />
        }
      >
        {/* Banner tiêu đề ResQ */}
        <View style={styles.headerBanner}>
          <View>
            <Text style={styles.bannerTitle}>Báo Cáo Hoạt Động Kho Hàng</Text>
            <Text style={styles.bannerSubtitle}>
              Tổng quan chỉ số tồn kho và giá trị sản phẩm
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => router.push('/admin/products')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>📦 Quản lý kho</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1b4332" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            {/* Hàng thẻ thống kê */}
            <View style={styles.statsRow}>
              <StatCard
                title="Sản phẩm đang lưu trữ"
                value={totalProducts}
                subtext="Mặt hàng khả dụng"
                accentColor="#1b4332"
                icon="📦"
              />
              <StatCard
                title="Tổng lượng tồn kho"
                value={totalQuantity}
                subtext="Số lượng sản phẩm trong kho"
                accentColor="#166534"
                icon="📊"
              />
              <StatCard
                title="Tổng giá trị hàng"
                value={formatVND(totalInventoryValue)}
                subtext="Quy mô giá trị kho"
                accentColor="#15803d"
                icon="💰"
              />
              <StatCard
                title="Mặt hàng cao cấp"
                value={maxPriceProduct ? maxPriceProduct.name : 'N/A'}
                subtext={maxPriceProduct ? formatVND(maxPriceProduct.price) : ''}
                accentColor="#1e3a8a"
                icon="⭐"
              />
            </View>

            {/* Bảng xem trước sản phẩm */}
            <View style={styles.tableSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sản Phẩm Trong Kho</Text>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => router.push('/admin/products')}
                >
                  <Text style={styles.viewAllText}>Xem tất cả ({products.length}) →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.table}>
                {products.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.productRow}
                    activeOpacity={0.85}
                    onPress={() => router.push('/admin/products')}
                  >
                    <Image
                      source={{ uri: getProductImageUri(item.image, item.name) }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.stockLabel}>Số lượng tồn: {item.soluong} chiếc</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceValue}>{formatVND(item.price)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f5',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
  },
  headerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    flexWrap: 'wrap',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1b4332',
    letterSpacing: -0.4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: '#1b4332',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  tableSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ece6',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 13,
    color: '#1b4332',
    fontWeight: '700',
  },
  table: {
    gap: 4,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 14,
    borderRadius: 12,
  },
  thumbImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f8faf7',
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  stockLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1b4332',
  },
});
