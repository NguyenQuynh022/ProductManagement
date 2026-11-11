import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Navbar } from '../../components/Navbar';
import { ProductFormModal } from '../../components/ProductFormModal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { productService } from '../../services/productService';
import { authService } from '../../services/authService';
import { Product } from '../../types/product';

export default function ProductsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<string>('');
  const [adminName, setAdminName] = useState('Quản lý');

  // Modals state
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Notification state
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const loadProducts = async (querySearch?: string, querySort?: string) => {
    try {
      setLoading(true);

      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        router.replace('/login');
        return;
      }

      const user = await authService.getCurrentUser();
      if (user) setAdminName(user.username);

      const params: { search?: string; sort?: string } = {};
      const currentSearch = querySearch !== undefined ? querySearch : search;
      const currentSort = querySort !== undefined ? querySort : sortOption;

      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (currentSort) params.sort = currentSort;

      const res = await productService.getProducts(params);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        await authService.logout();
        router.replace('/login');
      } else {
        showAlert('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearchSubmit = () => {
    loadProducts(search, sortOption);
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    loadProducts(search, newSort);
  };

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setFormModalVisible(true);
  };

  const handleOpenEditModal = (item: Product) => {
    setSelectedProduct(item);
    setFormModalVisible(true);
  };

  const handleFormSuccess = (savedProduct: Product, isEdit: boolean) => {
    if (isEdit) {
      setProducts(prev => prev.map(p => (p._id === savedProduct._id ? savedProduct : p)));
      showAlert(`Đã cập nhật "${savedProduct.name}"!`);
    } else {
      setProducts(prev => [savedProduct, ...prev]);
      showAlert(`Đã thêm mới "${savedProduct.name}"!`);
    }
  };

  const handleOpenDeleteModal = (item: Product) => {
    setProductToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      const res = await productService.deleteProduct(productToDelete._id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
        showAlert(`Đã xóa "${productToDelete.name}" thành công!`);
        setDeleteModalVisible(false);
        setProductToDelete(null);
      }
    } catch (err: any) {
      showAlert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatVND = (num: number) => {
    if (num === 0) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  return (
    <View style={styles.container}>
      <Navbar username={adminName} />

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadProducts(); }}
            colors={['#1b4332']}
          />
        }
      >
        {/* Header ResQ Store style */}
        <View style={styles.titleBanner}>
          <View>
            <Text style={styles.pageTitle}>Quản Lý Kho Hàng</Text>
            <Text style={styles.pageSubtitle}>
              {products.length} sản phẩm đang lưu trữ
            </Text>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>➕ Thêm sản phẩm</Text>
          </TouchableOpacity>
        </View>

        {/* Thông báo Alert */}
        {alertMessage && (
          <View
            style={[
              styles.alertBox,
              alertMessage.type === 'success' ? styles.alertSuccess : styles.alertError,
            ]}
          >
            <Text
              style={[
                styles.alertText,
                alertMessage.type === 'success' ? styles.alertSuccessText : styles.alertErrorText,
              ]}
            >
              {alertMessage.type === 'success' ? '✓ ' : '✕ '}
              {alertMessage.text}
            </Text>
          </View>
        )}

        {/* Thanh tìm kiếm & bộ lọc */}
        <View style={styles.searchCard}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tên sản phẩm..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearchSubmit}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); loadProducts('', sortOption); }}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSubmit}>
              <Text style={styles.searchBtnText}>Tìm</Text>
            </TouchableOpacity>
          </View>

          {/* Bộ lọc viên thuốc */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortFilterGroup}>
            {[
              { label: 'Tất cả', value: '' },
              { label: 'Giá thấp ↗', value: 'price_asc' },
              { label: 'Giá cao ↘', value: 'price_desc' },
              { label: 'Kho nhiều', value: 'soluong_desc' },
              { label: 'Kho ít', value: 'soluong_asc' },
            ].map(item => (
              <TouchableOpacity
                key={item.value}
                style={[styles.sortChip, sortOption === item.value && styles.sortChipActive]}
                onPress={() => handleSortChange(item.value)}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortOption === item.value && styles.sortChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nội dung danh sách sản phẩm */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1b4332" />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptySub}>
              Bấm "Thêm sản phẩm" để bắt đầu đăng sản phẩm lên kho.
            </Text>
          </View>
        ) : isMobile ? (
          /* GIAO DIỆN MOBILE: Card ResQ Style */
          <View style={styles.mobileListContainer}>
            {products.map((item) => (
              <View key={item._id} style={styles.mobileCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.mobileCardImage}
                  resizeMode="cover"
                />
                <View style={styles.mobileCardContent}>
                  <Text style={styles.mobileCardName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  
                  <View style={styles.mobileCardPriceRow}>
                    <Text style={styles.mobileCardPrice}>{formatVND(item.price)}</Text>
                    <View style={styles.mobileStockBadge}>
                      <Text style={styles.mobileStockText}>Kho: {item.soluong}</Text>
                    </View>
                  </View>

                  <View style={styles.mobileCardActions}>
                    <TouchableOpacity
                      style={styles.mobileEditBtn}
                      onPress={() => handleOpenEditModal(item)}
                    >
                      <Text style={styles.mobileEditBtnText}>✏️ Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.mobileDeleteBtn}
                      onPress={() => handleOpenDeleteModal(item)}
                    >
                      <Text style={styles.mobileDeleteBtnText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* GIAO DIỆN DESKTOP: Bảng ResQ Store */
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 60 }]}>#</Text>
              <Text style={[styles.th, { width: 80 }]}>Ảnh</Text>
              <Text style={[styles.th, { flex: 2 }]}>Tên sản phẩm</Text>
              <Text style={[styles.th, { flex: 1 }]}>Đơn giá</Text>
              <Text style={[styles.th, { width: 100 }]}>Kho hàng</Text>
              <Text style={[styles.th, { width: 160, textAlign: 'center' }]}>Thao tác</Text>
            </View>

            {products.map((item, index) => (
              <View key={item._id} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.td, { width: 60, color: '#888' }]}>{index + 1}</Text>
                <View style={[styles.cell, { width: 80 }]}>
                  <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                </View>
                <View style={[styles.cell, { flex: 2 }]}>
                  <Text style={styles.productName}>{item.name}</Text>
                </View>
                <Text style={[styles.td, styles.priceText, { flex: 1 }]}>
                  {formatVND(item.price)}
                </Text>
                <View style={[styles.cell, { width: 100 }]}>
                  <Text style={styles.stockText}>{item.soluong}</Text>
                </View>
                <View style={[styles.cell, styles.actionCell, { width: 160 }]}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEditModal(item)}
                  >
                    <Text style={styles.editBtnText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleOpenDeleteModal(item)}
                  >
                    <Text style={styles.deleteBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Thêm / Sửa Sản phẩm */}
      <ProductFormModal
        visible={formModalVisible}
        product={selectedProduct}
        onClose={() => setFormModalVisible(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Modal Xác nhận Xóa */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        productName={productToDelete?.name || ''}
        loading={deleting}
        onClose={() => { setDeleteModalVisible(false); setProductToDelete(null); }}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  titleBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1b4332',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#1b4332', // Deep Green
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  alertBox: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertSuccessText: {
    color: '#15803d',
  },
  alertErrorText: {
    color: '#dc2626',
  },
  searchCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8ece6',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf7',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  clearSearch: {
    fontSize: 14,
    color: '#9ca3af',
    paddingHorizontal: 6,
  },
  searchBtn: {
    backgroundColor: '#1b4332',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginLeft: 6,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sortFilterGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortChipActive: {
    borderColor: '#1b4332',
    backgroundColor: '#1b4332',
  },
  sortChipText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6b7280',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    padding: 40,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  emptySub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  /* MOBILE CARD STYLES */
  mobileListContainer: {
    gap: 12,
  },
  mobileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8ece6',
    padding: 12,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  mobileCardImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#f8faf7',
  },
  mobileCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mobileCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 19,
  },
  mobileCardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  mobileCardPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1b4332', // Deep Forest Green
  },
  mobileStockBadge: {
    backgroundColor: '#f1f5ee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mobileStockText: {
    fontSize: 11,
    color: '#1b4332',
    fontWeight: '700',
  },
  mobileCardActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  mobileEditBtn: {
    borderWidth: 1,
    borderColor: '#1b4332',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  mobileEditBtnText: {
    color: '#1b4332',
    fontSize: 12,
    fontWeight: '700',
  },
  mobileDeleteBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  mobileDeleteBtnText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  /* DESKTOP TABLE STYLES */
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8ece6',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8faf7',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ece6',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  th: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1b4332',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowAlt: {
    backgroundColor: '#fafcfa',
  },
  cell: {
    justifyContent: 'center',
  },
  td: {
    fontSize: 13,
    color: '#374151',
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f8faf7',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1b4332',
  },
  stockText: {
    fontSize: 13,
    color: '#4b5563',
  },
  actionCell: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#1b4332',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deleteBtnText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
});
