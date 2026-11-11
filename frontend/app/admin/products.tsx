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
  Modal,
  Pressable,
  RefreshControl,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Navbar } from '../../components/Navbar';
import { ProductFormModal } from '../../components/ProductFormModal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { productService } from '../../services/productService';
import { authService } from '../../services/authService';
import { Product } from '../../types/product';
import { getProductImageUri } from '../../utils/imageHelper';

export default function ProductsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<string>('');
  const [adminName, setAdminName] = useState('Admin');

  // Modal form thêm/sửa
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modal xác nhận xóa
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal xem chi tiết sản phẩm
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Thông báo
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const loadProducts = async (querySearch?: string, querySort?: string) => {
    try {
      setLoading(true);
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) { router.replace('/login'); return; }

      const user = await authService.getCurrentUser();
      if (user) setAdminName(user.username);

      const params: { search?: string; sort?: string } = {};
      const currentSearch = querySearch !== undefined ? querySearch : search;
      const currentSort = querySort !== undefined ? querySort : sortOption;
      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (currentSort) params.sort = currentSort;

      const res = await productService.getProducts(params);
      if (res.success) setProducts(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await authService.logout();
        router.replace('/login');
      } else {
        showAlert('Lỗi tải dữ liệu: ' + (err.response?.data?.message || err.message), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSearchSubmit = () => loadProducts(search, sortOption);
  const handleSortChange = (newSort: string) => { setSortOption(newSort); loadProducts(search, newSort); };
  const handleOpenAddModal = () => { setSelectedProduct(null); setFormModalVisible(true); };
  const handleOpenEditModal = (item: Product) => { setDetailVisible(false); setSelectedProduct(item); setFormModalVisible(true); };

  const handleFormSuccess = (savedProduct: Product, isEdit: boolean) => {
    if (isEdit) {
      setProducts(prev => prev.map(p => (p._id === savedProduct._id ? savedProduct : p)));
      showAlert(`Đã cập nhật "${savedProduct.name}"!`);
    } else {
      setProducts(prev => [savedProduct, ...prev]);
      showAlert(`Đã thêm mới "${savedProduct.name}"!`);
    }
  };

  const handleOpenDeleteModal = (item: Product) => { setDetailVisible(false); setProductToDelete(item); setDeleteModalVisible(true); };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      const res = await productService.deleteProduct(productToDelete._id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
        showAlert(`Đã xóa "${productToDelete.name}"!`);
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

  const openDetail = (item: Product) => {
    setDetailProduct(item);
    setDetailVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Navbar username={adminName} productCount={products.length} onAddPress={handleOpenAddModal} />

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
        {/* ── Tiêu đề trang ── */}
        <View style={styles.titleBanner}>
          <View style={styles.titleLeft}>
            <Text style={styles.pageTitle}>Quản Lý Sản Phẩm</Text>
            <Text style={styles.pageSubtitle}>
              {products.length} mặt hàng đang kinh doanh trong hệ thống
            </Text>
          </View>

          <View style={styles.titleRight}>
            {!isMobile && (
              <TouchableOpacity
                style={styles.desktopBannerAddBtn}
                onPress={handleOpenAddModal}
                activeOpacity={0.85}
              >
                <Text style={styles.desktopBannerAddBtnText}>➕ Thêm sản phẩm mới</Text>
              </TouchableOpacity>
            )}
            <View style={styles.statsBadge}>
              <Text style={styles.statsBadgeNum}>{products.length}</Text>
              <Text style={styles.statsBadgeLabel}>SP</Text>
            </View>
          </View>
        </View>

        {/* ── Thông báo ── */}
        {alertMessage && (
          <View style={[styles.alertBox, alertMessage.type === 'success' ? styles.alertSuccess : styles.alertError]}>
            <Text style={[styles.alertText, alertMessage.type === 'success' ? styles.alertSuccessText : styles.alertErrorText]}>
              {alertMessage.type === 'success' ? '✓ ' : '✕ '}{alertMessage.text}
            </Text>
          </View>
        )}

        {/* ── Thanh tìm kiếm & bộ lọc ── */}
        <View style={[styles.searchCard, !isMobile && styles.searchCardDesktop]}>
          <View style={[styles.searchBar, !isMobile && styles.searchBarDesktop]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm theo tên sản phẩm..."
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

          {/* Chips sắp xếp */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.sortFilterGroup, !isMobile && styles.sortFilterGroupDesktop]}
          >
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
                <Text style={[styles.sortChipText, sortOption === item.value && styles.sortChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Danh sách sản phẩm ── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1b4332" />
            <Text style={styles.loadingText}>Đang nạp danh sách sản phẩm...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptySub}>Nhấn nút ➕ để thêm sản phẩm mới vào kho.</Text>
          </View>
        ) : isMobile ? (
          /* ── MOBILE: Cards dạng danh sách ── */
          <View style={styles.mobileListContainer}>
            {products.map((item) => {
              const displayImage = getProductImageUri(item.image, item.name);
              return (
                <TouchableOpacity
                  key={item._id}
                  style={styles.mobileCard}
                  activeOpacity={0.88}
                  onPress={() => openDetail(item)}
                >
                  {/* Ảnh sản phẩm */}
                  <Image source={{ uri: displayImage }} style={styles.mobileCardImage} resizeMode="cover" />

                  <View style={styles.mobileCardContent}>
                    <Text style={styles.mobileCardName} numberOfLines={2}>{item.name}</Text>

                    <View style={styles.mobileCardPriceRow}>
                      <Text style={styles.mobileCardPrice}>{formatVND(item.price)}</Text>
                      <View style={styles.mobileStockBadge}>
                        <Text style={styles.mobileStockText}>Kho: {item.soluong}</Text>
                      </View>
                    </View>

                    <View style={styles.mobileCardActions}>
                      <TouchableOpacity
                        style={styles.mobileEditBtn}
                        onPress={(e) => { e.stopPropagation?.(); handleOpenEditModal(item); }}
                      >
                        <Text style={styles.mobileEditBtnText}>✏️ Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.mobileDeleteBtn}
                        onPress={(e) => { e.stopPropagation?.(); handleOpenDeleteModal(item); }}
                      >
                        <Text style={styles.mobileDeleteBtnText}>🗑️ Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Mũi tên nhỏ gợi ý nhấn để xem chi tiết */}
                  <Text style={styles.mobileCardChevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* ── DESKTOP: Bảng sản phẩm chuẩn web cân đối ── */
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 50, textAlign: 'center' }]}>#</Text>
              <Text style={[styles.th, { width: 80, textAlign: 'center' }]}>Hình ảnh</Text>
              <Text style={[styles.th, { flex: 3 }]}>Tên sản phẩm</Text>
              <Text style={[styles.th, { flex: 2 }]}>Đơn giá</Text>
              <Text style={[styles.th, { width: 140, textAlign: 'center' }]}>Tồn kho</Text>
              <Text style={[styles.th, { width: 170, textAlign: 'center' }]}>Thao tác</Text>
            </View>

            {products.map((item, index) => {
              const displayImage = getProductImageUri(item.image, item.name);
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                  activeOpacity={0.85}
                  onPress={() => openDetail(item)}
                >
                  <Text style={[styles.td, { width: 50, textAlign: 'center', color: '#9ca3af', fontWeight: '700' }]}>
                    {index + 1}
                  </Text>
                  <View style={[styles.cell, { width: 80, alignItems: 'center' }]}>
                    <Image source={{ uri: displayImage }} style={styles.productImage} resizeMode="cover" />
                  </View>
                  <View style={[styles.cell, { flex: 3 }]}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productIdSub}>ID: {item._id}</Text>
                  </View>
                  <Text style={[styles.td, styles.priceText, { flex: 2 }]}>
                    {formatVND(item.price)}
                  </Text>
                  <View style={[styles.cell, { width: 140, alignItems: 'center' }]}>
                    <View style={styles.stockPill}>
                      <Text style={styles.stockPillText}>Kho: {item.soluong} chiếc</Text>
                    </View>
                  </View>
                  <View style={[styles.cell, styles.actionCell, { width: 170 }]}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={(e) => { e.stopPropagation?.(); handleOpenEditModal(item); }}
                    >
                      <Text style={styles.editBtnText}>✏️ Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={(e) => { e.stopPropagation?.(); handleOpenDeleteModal(item); }}
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── FAB Thêm sản phẩm (chỉ hiển thị trên Mobile) ── */}
      {isMobile && (
        <TouchableOpacity style={styles.fabBtn} activeOpacity={0.85} onPress={handleOpenAddModal}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* ── Modal Chi tiết sản phẩm ── */}
      <Modal
        visible={detailVisible}
        transparent={!isMobile}
        animationType="slide"
        onRequestClose={() => setDetailVisible(false)}
      >
        <SafeAreaView style={[styles.detailSafeArea, !isMobile && styles.detailSafeAreaDesktop]}>
          <StatusBar style="dark" />
          {detailProduct && (() => {
            const img = getProductImageUri(detailProduct.image, detailProduct.name);
            return (
              <View style={[styles.detailContainer, !isMobile && styles.detailContainerDesktop]}>
                {/* Thanh tiêu đề chi tiết */}
                <View style={styles.detailHeader}>
                  <TouchableOpacity
                    style={styles.detailBackBtn}
                    onPress={() => setDetailVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.detailBackIcon}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.detailHeaderTitle}>Chi Tiết Sản Phẩm</Text>
                  <View style={{ width: 42 }} />
                </View>

                {/* Nội dung chi tiết cuộn */}
                <ScrollView
                  style={styles.detailScroll}
                  contentContainerStyle={styles.detailScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Ảnh sản phẩm lớn */}
                  <View style={styles.detailImageCard}>
                    <Image source={{ uri: img }} style={styles.detailImage} resizeMode="cover" />
                  </View>

                  <View style={styles.detailInfoBox}>
                    <Text style={styles.detailName}>{detailProduct.name}</Text>
                    <Text style={styles.detailPrice}>{formatVND(detailProduct.price)}</Text>

                    {/* Các thẻ thông tin */}
                    <View style={styles.detailInfoRow}>
                      <View style={styles.detailInfoCard}>
                        <Text style={styles.detailInfoLabel}>📦 Tồn kho</Text>
                        <Text style={styles.detailInfoValue}>{detailProduct.soluong} chiếc</Text>
                      </View>
                      <View style={styles.detailInfoCard}>
                        <Text style={styles.detailInfoLabel}>🏷️ Trạng thái</Text>
                        <Text
                          style={[
                            styles.detailInfoValue,
                            { color: detailProduct.soluong > 0 ? '#15803d' : '#dc2626' },
                          ]}
                        >
                          {detailProduct.soluong > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailInfoRowSingle}>
                      <Text style={styles.detailInfoLabel}>🆔 Mã sản phẩm (ID)</Text>
                      <Text style={styles.detailIdText}>{detailProduct._id}</Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Thanh nút bấm cố định dưới đáy màn hình */}
                <View style={styles.detailBottomBar}>
                  <TouchableOpacity
                    style={styles.detailEditBtn}
                    onPress={() => handleOpenEditModal(detailProduct)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.detailEditBtnText}>✏️ Chỉnh sửa sản phẩm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.detailDeleteBtn}
                    onPress={() => handleOpenDeleteModal(detailProduct)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.detailDeleteBtnText}>🗑️ Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
        </SafeAreaView>
      </Modal>

      {/* ── Modal Thêm / Sửa ── */}
      <ProductFormModal
        visible={formModalVisible}
        product={selectedProduct}
        onClose={() => setFormModalVisible(false)}
        onSuccess={handleFormSuccess}
      />

      {/* ── Modal Xác nhận Xóa ── */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        productName={productToDelete?.name || ''}
        loading={deleting}
        onClose={() => { setDeleteModalVisible(false); setProductToDelete(null); }}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7f5' },
  mainScroll: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 100, maxWidth: 1240, width: '100%', alignSelf: 'center' },

  /* ── Tiêu đề trang ── */
  titleBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  titleLeft: { flex: 1, minWidth: 260 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#1b4332', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 3 },
  titleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  desktopBannerAddBtn: {
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
  desktopBannerAddBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  statsBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1b4332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBadgeNum: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  statsBadgeLabel: { color: '#a7f3d0', fontSize: 10, fontWeight: '700' },

  /* ── Alert ── */
  alertBox: { padding: 12, borderRadius: 14, marginBottom: 14 },
  alertSuccess: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  alertError: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  alertText: { fontSize: 13, fontWeight: '600' },
  alertSuccessText: { color: '#15803d' },
  alertErrorText: { color: '#dc2626' },

  /* ── Search ── */
  searchCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8ece6',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchCardDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  searchBarDesktop: {
    flex: 1,
    maxWidth: 460,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: '#111827' },
  clearSearch: { fontSize: 14, color: '#9ca3af', paddingHorizontal: 6 },
  searchBtn: {
    backgroundColor: '#1b4332',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 6,
  },
  searchBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  sortFilterGroup: { flexDirection: 'row', gap: 8, marginTop: 12 },
  sortFilterGroupDesktop: { marginTop: 0 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortChipActive: { borderColor: '#1b4332', backgroundColor: '#1b4332' },
  sortChipText: { fontSize: 12, color: '#4b5563', fontWeight: '600' },
  sortChipTextActive: { color: '#ffffff', fontWeight: '700' },

  /* ── Loading / Empty ── */
  loadingBox: { padding: 48, alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#6b7280' },
  emptyBox: {
    backgroundColor: '#ffffff', padding: 48, alignItems: 'center',
    borderRadius: 20, borderWidth: 1, borderColor: '#e8ece6',
  },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  emptySub: { fontSize: 13, color: '#6b7280', marginTop: 6, textAlign: 'center' },

  /* ── Mobile Card ── */
  mobileListContainer: { gap: 12 },
  mobileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ece6',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mobileCardImage: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: '#f0f4ee',
  },
  mobileCardContent: { flex: 1 },
  mobileCardName: { fontSize: 15, fontWeight: '800', color: '#111827', lineHeight: 20, marginBottom: 6 },
  mobileCardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mobileCardPrice: { fontSize: 15, fontWeight: '900', color: '#1b4332' },
  mobileStockBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  mobileStockText: { fontSize: 11, color: '#065f46', fontWeight: '700' },
  mobileCardActions: { flexDirection: 'row', gap: 8 },
  mobileEditBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#1b4332',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mobileEditBtnText: { color: '#1b4332', fontSize: 12, fontWeight: '700' },
  mobileDeleteBtn: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mobileDeleteBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  mobileCardChevron: { fontSize: 22, color: '#d1d5db', marginLeft: 2 },

  /* ── Desktop Table ── */
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ece6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f7f4',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ece6',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  th: { fontSize: 13, fontWeight: '800', color: '#1b4332', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowAlt: { backgroundColor: '#fafcfa' },
  cell: { justifyContent: 'center' },
  td: { fontSize: 14, color: '#374151' },
  productImage: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#f8faf7',
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  productName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  productIdSub: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 2 },
  priceText: { fontSize: 15, fontWeight: '900', color: '#1b4332' },
  stockPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  stockPillText: { fontSize: 12, color: '#065f46', fontWeight: '800' },
  actionCell: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  editBtn: {
    backgroundColor: '#1b4332',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  editBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },

  /* ── FAB (Mobile only) ── */
  fabBtn: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1b4332',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: { color: '#ffffff', fontSize: 32, fontWeight: '300', lineHeight: 38 },

  /* ── Màn hình chi tiết sản phẩm ── */
  detailSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  detailSafeAreaDesktop: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#f6f8f5',
  },
  detailContainerDesktop: {
    flex: 0,
    maxWidth: 580,
    width: '100%',
    maxHeight: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ece6',
  },
  detailBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBackIcon: {
    fontSize: 24,
    color: '#1b4332',
    fontWeight: '700',
    marginTop: -2,
  },
  detailHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    padding: 16,
    paddingBottom: 24,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  detailImageCard: {
    width: '100%',
    height: 280,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8ece6',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailInfoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8ece6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  detailName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  detailPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1b4332',
    marginBottom: 18,
  },
  detailInfoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailInfoCard: {
    flex: 1,
    backgroundColor: '#f8faf7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  detailInfoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailInfoValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  detailInfoRowSingle: {
    backgroundColor: '#f8faf7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  detailIdText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  detailBottomBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8ece6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  detailEditBtn: {
    flex: 1,
    backgroundColor: '#1b4332',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  detailEditBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  detailDeleteBtn: {
    backgroundColor: '#fff5f5',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  detailDeleteBtnText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
