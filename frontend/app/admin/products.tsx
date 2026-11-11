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
  const [adminName, setAdminName] = useState('Người bán');

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
    return '₫' + new Intl.NumberFormat('vi-VN').format(num);
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
            colors={['#ee4d2d']}
          />
        }
      >
        {/* Header Shopee Seller style */}
        <View style={styles.titleBanner}>
          <View>
            <Text style={styles.pageTitle}>Quản Lý Sản Phẩm</Text>
            <Text style={styles.pageSubtitle}>
              {products.length} sản phẩm đang bán
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

        {/* Thanh tìm kiếm Shopee style */}
        <View style={styles.searchCard}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tên sản phẩm..."
              placeholderTextColor="#999"
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

          {/* Bộ lọc sắp xếp Shopee Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortFilterGroup}>
            {[
              { label: 'Phổ biến', value: '' },
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
            <ActivityIndicator size="large" color="#ee4d2d" />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptySub}>
              Bấm "Thêm sản phẩm" để bắt đầu đăng bán.
            </Text>
          </View>
        ) : isMobile ? (
          /* GIAO DIỆN MOBILE: Dạng Shopee Product Card Item */
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
          /* GIAO DIỆN DESKTOP: Bảng Shopee Seller Centre */
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 60 }]}>#</Text>
              <Text style={[styles.th, { width: 80 }]}>Ảnh</Text>
              <Text style={[styles.th, { flex: 2 }]}>Tên sản phẩm</Text>
              <Text style={[styles.th, { flex: 1 }]}>Giá bán</Text>
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
    backgroundColor: '#f5f5f5', // Shopee Gray Background
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 40,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  titleBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#ee4d2d', // Shopee Orange
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    shadowColor: '#ee4d2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  alertBox: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  alertSuccess: {
    backgroundColor: '#e6f7ec',
    borderWidth: 1,
    borderColor: '#a3e6b7',
  },
  alertError: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffc2c2',
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertSuccessText: {
    color: '#12873b',
  },
  alertErrorText: {
    color: '#ee4d2d',
  },
  searchCard: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: '#222',
  },
  clearSearch: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 6,
  },
  searchBtn: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 3,
    marginLeft: 4,
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
    paddingBottom: 2,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortChipActive: {
    borderColor: '#ee4d2d',
    backgroundColor: '#fff5f3',
  },
  sortChipText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: '#ee4d2d',
    fontWeight: '700',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#777',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    padding: 40,
    alignItems: 'center',
    borderRadius: 6,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  emptySub: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  /* MOBILE CARD STYLES */
  mobileListContainer: {
    gap: 10,
  },
  mobileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  mobileCardImage: {
    width: 84,
    height: 84,
    borderRadius: 4,
    backgroundColor: '#f8f8f8',
  },
  mobileCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mobileCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    lineHeight: 18,
  },
  mobileCardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  mobileCardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ee4d2d', // Shopee Price
  },
  mobileStockBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  mobileStockText: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  mobileCardActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  mobileEditBtn: {
    borderWidth: 1,
    borderColor: '#ee4d2d',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 3,
  },
  mobileEditBtnText: {
    color: '#ee4d2d',
    fontSize: 12,
    fontWeight: '600',
  },
  mobileDeleteBtn: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 3,
  },
  mobileDeleteBtnText: {
    color: '#757575',
    fontSize: 12,
    fontWeight: '600',
  },
  /* DESKTOP TABLE STYLES */
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  th: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  cell: {
    justifyContent: 'center',
  },
  td: {
    fontSize: 13,
    color: '#333',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ee4d2d',
  },
  stockText: {
    fontSize: 13,
    color: '#444',
  },
  actionCell: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deleteBtnText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
});
