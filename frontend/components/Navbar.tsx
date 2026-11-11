import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../services/authService';
import { storage } from '../services/storage';

interface NavbarProps {
  username?: string;
  productCount?: number;
  onAddPress?: () => void;
}

// Danh sách các logo cửa hàng gợi ý đẹp, hiện đại
const PRESET_LOGOS = [
  {
    name: 'Cửa hàng Boutique',
    uri: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=80',
  },
  {
    name: 'Shop Công Nghệ',
    uri: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=200&q=80',
  },
  {
    name: 'Store Thời Trang',
    uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80',
  },
  {
    name: 'Flagship Store',
    uri: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&q=80',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  username = 'Admin',
  productCount,
  onAddPress,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [storeLogo, setStoreLogo] = useState(PRESET_LOGOS[0].uri);

  useEffect(() => {
    const loadLogo = async () => {
      const savedLogo = await storage.getStoreLogo();
      if (savedLogo) setStoreLogo(savedLogo);
    };
    loadLogo();
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setProfileOpen(false);
    await authService.logout();
    router.replace('/login');
  };

  const handleNav = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  // Chọn ảnh logo từ điện thoại
  const handlePickLogoFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để đổi logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newLogoUri = result.assets[0].uri;
        setStoreLogo(newLogoUri);
        await storage.setStoreLogo(newLogoUri);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + err.message);
    }
  };

  const handleSelectPresetLogo = async (uri: string) => {
    setStoreLogo(uri);
    await storage.setStoreLogo(uri);
  };

  const navItems = [
    { label: '📦 Quản lý sản phẩm', path: '/admin/products' },
    { label: '📊 Thống kê doanh thu & kho', path: '/admin/dashboard' },
  ];

  return (
    <View>
      {/* ───────── Thanh header rộng rãi, không bị cấn thanh trạng thái ───────── */}
      <View style={styles.container}>

        {/* Cột trái: Logo cửa hàng có thể bấm đổi ảnh */}
        <TouchableOpacity
          style={styles.logoBtn}
          onPress={() => setProfileOpen(true)}
          activeOpacity={0.85}
        >
          <View style={styles.logoBadge}>
            <Image source={{ uri: storeLogo }} style={styles.logoImage} resizeMode="cover" />
            <View style={styles.logoEditBadge}>
              <Text style={styles.logoEditText}>✏️</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Cột giữa: Tiêu đề Quản Lý Bán Hàng */}
        <TouchableOpacity
          style={styles.titleContainer}
          onPress={() => setProfileOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.brandTitle} numberOfLines={1}>Quản Lý Bán Hàng</Text>
        </TouchableOpacity>

        {/* Cột phải: Nút hamburger ☰ */}
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
      </View>

      {/* ───────── Modal: Profile cửa hàng & Chỉnh sửa Logo ───────── */}
      <Modal
        visible={profileOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setProfileOpen(false)}>
          <Pressable style={styles.profileSheet} onPress={() => {}}>
            {/* Thanh kéo */}
            <View style={styles.sheetHandle} />

            {/* Avatar cửa hàng kèm nút đổi ảnh */}
            <View style={styles.profileAvatarWrap}>
              <View style={styles.profileAvatar}>
                <Image source={{ uri: storeLogo }} style={styles.profileAvatarImg} resizeMode="cover" />
              </View>
              <TouchableOpacity
                style={styles.avatarEditBtn}
                onPress={handlePickLogoFromGallery}
                activeOpacity={0.85}
              >
                <Text style={styles.avatarEditIcon}>📷</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.profileStoreName}>Quản Lý Bán Hàng</Text>
            <Text style={styles.profileStoreDesc}>Cửa hàng &amp; Kho hàng trực tuyến</Text>

            <View style={styles.profileDivider} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Nút đổi ảnh logo từ điện thoại */}
              <TouchableOpacity
                style={styles.pickPhotoBtn}
                onPress={handlePickLogoFromGallery}
                activeOpacity={0.85}
              >
                <Text style={styles.pickPhotoIcon}>🖼️</Text>
                <Text style={styles.pickPhotoText}>Tải logo mới từ thư viện ảnh</Text>
              </TouchableOpacity>

              {/* Bộ sưu tập logo mẫu */}
              <Text style={styles.presetHeading}>Hoặc chọn nhanh logo mẫu đẹp:</Text>
              <View style={styles.presetGrid}>
                {PRESET_LOGOS.map((item, index) => {
                  const isSelected = storeLogo === item.uri;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.presetItem, isSelected && styles.presetItemActive]}
                      onPress={() => handleSelectPresetLogo(item.uri)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: item.uri }} style={styles.presetImg} resizeMode="cover" />
                      <Text style={[styles.presetLabel, isSelected && styles.presetLabelActive]} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Thông tin nhanh */}
              <View style={styles.profileInfoGrid}>
                <View style={styles.profileInfoCard}>
                  <Text style={styles.profileInfoIcon}>👤</Text>
                  <Text style={styles.profileInfoLabel}>Quản trị viên</Text>
                  <Text style={styles.profileInfoValue}>{username}</Text>
                </View>
                <View style={styles.profileInfoCard}>
                  <Text style={styles.profileInfoIcon}>📦</Text>
                  <Text style={styles.profileInfoLabel}>Sản phẩm trong kho</Text>
                  <Text style={styles.profileInfoValue}>
                    {productCount !== undefined ? productCount : '—'} mặt hàng
                  </Text>
                </View>
              </View>

              <View style={styles.profileBtnGroup}>
                <TouchableOpacity
                  style={styles.profileCloseBtn}
                  onPress={() => setProfileOpen(false)}
                >
                  <Text style={styles.profileCloseBtnText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileLogoutBtn} onPress={handleLogout}>
                  <Text style={styles.profileLogoutBtnText}>🚪 Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ───────── Modal: Menu hamburger ───────── */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.dropdownOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.dropdownMenu}>
            {/* Tiêu đề menu */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderTitle}>Menu Quản Trị</Text>
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Text style={styles.menuClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuDivider} />

            {/* Mục điều hướng */}
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleNav(item.path)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.label}
                  </Text>
                  {isActive && <Text style={styles.menuItemCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}

            {onAddPress && (
              <>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuAddBtn}
                  onPress={() => { setMenuOpen(false); onAddPress(); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.menuAddBtnText}>➕ Thêm sản phẩm mới</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuLogoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={styles.menuLogoutText}>🚪 Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  /* ── Header 3 cột rộng rãi, đẩy xuống dưới thanh trạng thái ── */
  container: {
    backgroundColor: '#1b4332',
    paddingTop: Platform.OS === 'android' ? 38 : (Platform.OS === 'ios' ? 46 : 18),
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  logoBtn: {
    marginRight: 10,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: '#a7f3d0',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#1b4332',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  logoEditText: {
    fontSize: 9,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  hamburgerBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },

  /* ── Modal overlay ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },

  /* ── Profile bottom sheet ── */
  profileSheet: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 32,
    maxHeight: '85%',
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileAvatarWrap: {
    alignSelf: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  profileAvatar: {
    width: 86,
    height: 86,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#1b4332',
    overflow: 'hidden',
    backgroundColor: '#f1f5ee',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1b4332',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  profileStoreName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  profileStoreDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  profileDivider: {
    height: 1,
    backgroundColor: '#f0f4ee',
    marginBottom: 14,
  },
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#1b4332',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  pickPhotoIcon: {
    fontSize: 18,
  },
  pickPhotoText: {
    color: '#1b4332',
    fontSize: 14,
    fontWeight: '800',
  },
  presetHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  presetItem: {
    flex: 1,
    alignItems: 'center',
    padding: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8ece6',
    backgroundColor: '#f8faf7',
  },
  presetItemActive: {
    borderColor: '#1b4332',
    backgroundColor: '#ecfdf5',
  },
  presetImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '600',
  },
  presetLabelActive: {
    color: '#1b4332',
    fontWeight: '800',
  },
  profileInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  profileInfoCard: {
    flex: 1,
    backgroundColor: '#f8faf7',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  profileInfoIcon: { fontSize: 22, marginBottom: 4 },
  profileInfoLabel: { fontSize: 11, color: '#6b7280', fontWeight: '600', marginBottom: 2 },
  profileInfoValue: { fontSize: 13, fontWeight: '800', color: '#1b4332', textAlign: 'center' },
  profileBtnGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  profileCloseBtn: {
    flex: 1,
    backgroundColor: '#f0f4ee',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8e2d4',
  },
  profileCloseBtnText: { color: '#1b4332', fontSize: 14, fontWeight: '700' },
  profileLogoutBtn: {
    flex: 1,
    backgroundColor: '#fff5f5',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  profileLogoutBtnText: { color: '#dc2626', fontSize: 14, fontWeight: '700' },

  /* ── Dropdown menu ☰ ── */
  dropdownMenu: {
    marginTop: 78,
    marginRight: 14,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 270,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#f8faf7',
  },
  menuHeaderTitle: { fontSize: 15, fontWeight: '800', color: '#1b4332' },
  menuClose: { fontSize: 18, color: '#6b7280', fontWeight: '700' },
  menuDivider: { height: 1, backgroundColor: '#f0f4ee' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  menuItemActive: { backgroundColor: '#f0fdf4' },
  menuItemText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  menuItemTextActive: { color: '#1b4332', fontWeight: '800' },
  menuItemCheck: { fontSize: 15, color: '#1b4332', fontWeight: '800' },
  menuAddBtn: { paddingHorizontal: 18, paddingVertical: 16, backgroundColor: '#f0fdf4' },
  menuAddBtnText: { fontSize: 14, color: '#1b4332', fontWeight: '700' },
  menuLogoutBtn: { paddingHorizontal: 18, paddingVertical: 16 },
  menuLogoutText: { fontSize: 14, color: '#dc2626', fontWeight: '700' },
});
