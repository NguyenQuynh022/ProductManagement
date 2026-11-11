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
  Platform,
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<string>('');
  const [adminName, setAdminName] = useState('Admin');

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
    setTimeout(() => setAlertMessage(null), 4000);
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
        showAlert('Lỗi khi tải danh sách sản phẩm: ' + (err.response?.data?.message || err.message), 'error');
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
      showAlert(`Đã cập nhật sản phẩm "${savedProduct.name}" thành công!`);
    } else {
      setProducts(prev => [savedProduct, ...prev]);
      showAlert(`Đã thêm mới sản phẩm "${savedProduct.name}" thành công!`);
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
        showAlert(`Đã xóa sản phẩm "${productToDelete.name}" thành công!`);
        setDeleteModalVisible(false);
        setProductToDelete(null);
      }
    } catch (err: any) {
      showAlert('Lỗi khi xóa sản phẩm: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportJson = async () => {
    try {
      const res = await productService.exportJson();
      if (res.success) {
        showAlert('Đã xuất dữ liệu ra file database/products.json thành công!');
      }
    } catch (err: any) {
      showAlert('Lỗi khi xuất file JSON: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(); }} />
        }
      >
        {/* Banner tiêu đề */}
        <View style={styles.titleBanner}>
          <View>
            <Text style={styles.pageTitle}>Quản Lý Sản Phẩm (Product Management)</Text>
            <Text style={styles.pageSubtitle}>
              Thêm, sửa, xóa, tìm kiếm và phân loại sản phẩm trong cơ sở dữ liệu MongoDB
            </Text>
          </View>

          <View style={styles.topActionBtns}>
            <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal}>
              <Text style={styles.addBtnText}>➕ Thêm sản phẩm mới</Text>
            </TouchableOpacity>
          </View>
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
              {alertMessage.type === 'success' ? '✅ ' : '❌ '}
              {alertMessage.text}
            </Text>
          </View>
        )}

        {/* Thanh công cụ Tìm kiếm và Sắp xếp */}
        <View style={styles.toolbar}>
          {/* Ô tìm kiếm */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm theo tên (ví dụ: iPhone, Samsung)..."
              placeholderTextColor="#94a3b8"
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
              <Text style={styles.searchBtnText}>Tìm kiếm</Text>
            </TouchableOpacity>
          </View>

          {/* Bộ lọc sắp xếp */}
          <View style={styles.sortFilterGroup}>
            <Text style={styles.sortLabel}>Sắp xếp:</Text>
            {[
              { label: 'Mặc định', value: '' },
              { label: 'Giá ↑', value: 'price_asc' },
              { label: 'Giá ↓', value: 'price_desc' },
              { label: 'SL ↑', value: 'soluong_asc' },
              { label: 'SL ↓', value: 'soluong_desc' },
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
          </View>
        </View>

        {/* Bảng dữ liệu sản phẩm */}
        <View style={styles.tableCard}>
          <View style={styles.tableCardHeader}>
            <Text style={styles.tableCardTitle}>
              Danh Sách Sản Phẩm ({products.length} sản phẩm)
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Đang tải dữ liệu từ Backend...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm nào</Text>
              <Text style={styles.emptySub}>
                Thử tìm với từ khóa khác hoặc bấm "Mặc định" để nạp lại toàn bộ danh sách.
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
              <View style={styles.tableWrapper}>
                {/* Header bảng */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: 80 }]}>STT</Text>
                  <Text style={[styles.th, { width: 100 }]}>Hình ảnh</Text>
                  <Text style={[styles.th, { width: 280 }]}>Tên sản phẩm</Text>
                  <Text style={[styles.th, { width: 160 }]}>Đơn giá</Text>
                  <Text style={[styles.th, { width: 120 }]}>Số lượng</Text>
                  <Text style={[styles.th, { width: 180 }]}>Thao tác</Text>
                </View>

                {/* Các dòng sản phẩm */}
                {products.map((item, index) => (
                  <View
                    key={item._id}
                    style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}
                  >
                    <Text style={[styles.td, styles.sttText, { width: 80 }]}>{index + 1}</Text>
                    <View style={[styles.td, { width: 100 }]}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={[styles.td, { width: 280 }]}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productId}>ID: {item._id}</Text>
                    </View>
                    <Text style={[styles.td, styles.priceText, { width: 160 }]}>
                      {formatVND(item.price)}
                    </Text>
                    <View style={[styles.td, { width: 120 }]}>
                      <View style={styles.stockBadge}>
                        <Text style={styles.stockText}>{item.soluong}</Text>
                      </View>
                    </View>
                    <View style={[styles.td, styles.actionCell, { width: 180 }]}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleOpenEditModal(item)}
                      >
                        <Text style={styles.editBtnText}>✏️ Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleOpenDeleteModal(item)}
                      >
                        <Text style={styles.deleteBtnText}>🗑️ Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
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
        product={productToDelete}
        loading={deleting}
        onCancel={() => {
          setDeleteModalVisible(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
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
  titleBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  topActionBtns: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  exportBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exportBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  alertBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  alertSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  alertSuccessText: {
    color: '#065f46',
    fontWeight: '600',
    fontSize: 13,
  },
  alertError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  alertErrorText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  alertText: {
    fontSize: 13,
  },
  toolbar: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    gap: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  clearSearch: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 8,
  },
  searchBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    marginLeft: 8,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sortFilterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 4,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sortChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#ffffff',
  },
  tableCard: {
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
  tableCardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  tableCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  loadingBox: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  emptyBox: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  tableWrapper: {
    minWidth: 920,
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
  sttText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
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
  stockBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  actionCell: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
});

