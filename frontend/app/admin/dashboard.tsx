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

export default function DashboardScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [exportMessage, setExportMessage] = useState<string | null>(null);

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

  const handleExportJson = async () => {
    try {
      setExportMessage('Đang xử lý xuất dữ liệu...');
      const res = await productService.exportJson();
      if (res.success) {
        setExportMessage('✅ Đã xuất dữ liệu ra file database/products.json thành công!');
        setTimeout(() => setExportMessage(null), 4000);
      }
    } catch (err: any) {
      setExportMessage('❌ Lỗi khi xuất file: ' + (err.response?.data?.message || err.message));
    }
  };

  // Tính toán các chỉ số thống kê
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
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <View style={styles.container}>
      <Navbar username={adminName} />

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboardData(); }} />
        }
      >
        {/* Banner tiêu đề */}
        <View style={styles.headerBanner}>
          <View>
            <Text style={styles.bannerTitle}>Bảng Điều Khiển Tổng Quan (Dashboard)</Text>
            <Text style={styles.bannerSubtitle}>
              Theo dõi kho hàng, thống kê số lượng và tình trạng sản phẩm trong MongoDB
            </Text>
          </View>

          <View style={styles.actionBtnRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/admin/products')}>
              <Text style={styles.primaryBtnText}>📦 Quản lý sản phẩm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleExportJson}>
              <Text style={styles.secondaryBtnText}>💾 Xuất JSON nộp bài</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thông báo xuất file */}
        {exportMessage && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{exportMessage}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Đang nạp dữ liệu từ MongoDB...</Text>
          </View>
        ) : (
          <>
            {/* Hàng thẻ thống kê */}
            <View style={styles.statsRow}>
              <StatCard
                title="Tổng số sản phẩm"
                value={totalProducts}
                subtext="Sản phẩm đang lưu trữ"
                accentColor="#3b82f6"
                icon="📦"
              />
              <StatCard
                title="Tổng lượng tồn kho"
                value={totalQuantity}
                subtext="Tổng số lượng các mặt hàng"
                accentColor="#10b981"
                icon="📊"
              />
              <StatCard
                title="Tổng giá trị kho"
                value={formatVND(totalInventoryValue)}
                subtext="Giá trị tồn kho tính theo đơn giá"
                accentColor="#8b5cf6"
                icon="💰"
              />
              <StatCard
                title="Sản phẩm giá cao nhất"
                value={maxPriceProduct ? maxPriceProduct.name : 'N/A'}
                subtext={maxPriceProduct ? formatVND(maxPriceProduct.price) : ''}
                accentColor="#f59e0b"
                icon="⭐"
              />
            </View>

            {/* Bảng xem trước danh sách sản phẩm */}
            <View style={styles.tableSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Danh Sách Sản Phẩm Hiện Có</Text>
                  <Text style={styles.sectionSubtitle}>Dữ liệu thực tế từ collection `products`</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => router.push('/admin/products')}
                >
                  <Text style={styles.viewAllText}>Xem và quản lý toàn bộ →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.table}>
                {/* Header bảng */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 1 }]}>Hình ảnh</Text>
                  <Text style={[styles.th, { flex: 3 }]}>Tên sản phẩm</Text>
                  <Text style={[styles.th, { flex: 2 }]}>Đơn giá</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>Số lượng</Text>
                  <Text style={[styles.th, { flex: 2.5 }]}>Thành tiền</Text>
                </View>

                {/* Danh sách các dòng */}
                {products.map((item, index) => (
                  <View
                    key={item._id}
                    style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}
                  >
                    <View style={[styles.td, { flex: 1 }]}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.thumbImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={[styles.td, { flex: 3 }]}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productId}>ID: {item._id}</Text>
                    </View>
                    <View style={[styles.td, { flex: 2 }]}>
                      <Text style={styles.priceText}>{formatVND(item.price)}</Text>
                    </View>
                    <View style={[styles.td, { flex: 1.5 }]}>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>{item.soluong}</Text>
                      </View>
                    </View>
                    <View style={[styles.td, { flex: 2.5 }]}>
                      <Text style={styles.totalItemPrice}>
                        {formatVND(item.price * item.soluong)}
                      </Text>
                    </View>
                  </View>
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
    backgroundColor: '#f8fafc',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  headerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  messageBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  messageText: {
    color: '#065f46',
    fontWeight: '600',
    fontSize: 13,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  tableSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  viewAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
  },
  viewAllText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 13,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  td: {
    justifyContent: 'center',
  },
  thumbImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  productId: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  quantityBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  totalItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
});

