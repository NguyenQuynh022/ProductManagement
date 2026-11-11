import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { authService } from '../services/authService';

interface NavbarProps {
  username?: string;
  productCount?: number;
  onAddPress?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  username = 'Admin',
  productCount,
  onAddPress,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  const navItems = [
    { label: '📦 Quản lý sản phẩm', path: '/admin/products' },
    { label: '📊 Thống kê doanh thu & kho', path: '/admin/dashboard' },
  ];

  return (
    <View>
      {/* ───────── Thanh header 3 cột cân đối ───────── */}
      <View style={styles.container}>

        {/* Cột trái: Logo */}
        <TouchableOpacity
          style={styles.logoBtn}
          onPress={() => setProfileOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>🛍️</Text>
          </View>
        </TouchableOpacity>

        {/* Cột giữa: Tiêu đề */}
        <TouchableOpacity
          style={styles.titleContainer}
          onPress={() => setProfileOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.brandTitle} numberOfLines={1}>Quản Lý Bán Hàng</Text>
          <Text style={styles.brandSub}>Nhấn để xem hồ sơ cửa hàng</Text>
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

      {/* ───────── Modal: Profile cửa hàng ───────── */}
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

            {/* Avatar cửa hàng */}
            <View style={styles.profileAvatarWrap}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarIcon}>🛍️</Text>
              </View>
              <View style={styles.profileOnlineDot} />
            </View>

            <Text style={styles.profileStoreName}>Quản Lý Bán Hàng</Text>
            <Text style={styles.profileStoreDesc}>Hệ thống quản trị kho hàng & bán lẻ</Text>

            <View style={styles.profileDivider} />

            {/* Thông tin */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.profileInfoGrid}>
                <View style={styles.profileInfoCard}>
                  <Text style={styles.profileInfoIcon}>👤</Text>
                  <Text style={styles.profileInfoLabel}>Quản trị viên</Text>
                  <Text style={styles.profileInfoValue}>{username}</Text>
                </View>
                <View style={styles.profileInfoCard}>
                  <Text style={styles.profileInfoIcon}>📦</Text>
                  <Text style={styles.profileInfoLabel}>Sản phẩm</Text>
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
                  <Text style={styles.profileCloseBtnText}>Đóng hồ sơ</Text>
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
  /* ── Header 3 cột ── */
  container: {
    backgroundColor: '#1b4332',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  logoBtn: {
    marginRight: 10,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoText: { fontSize: 22 },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  brandSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 1,
  },
  hamburgerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },

  /* ── Modal overlay chung ── */
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
    maxHeight: '82%',
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileAvatarWrap: {
    alignSelf: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1b4332',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  profileAvatarIcon: { fontSize: 36 },
  profileOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 2.5,
    borderColor: '#ffffff',
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
    marginBottom: 18,
  },
  profileDivider: { height: 1, backgroundColor: '#f0f4ee', marginBottom: 16 },
  profileInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  profileInfoCard: {
    flex: 1,
    backgroundColor: '#f8faf7',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8ece6',
  },
  profileInfoIcon: { fontSize: 22, marginBottom: 6 },
  profileInfoLabel: { fontSize: 11, color: '#6b7280', fontWeight: '600', marginBottom: 4 },
  profileInfoValue: { fontSize: 13, fontWeight: '800', color: '#1b4332', textAlign: 'center' },
  profileBtnGroup: { flexDirection: 'row', gap: 12, marginTop: 8 },
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
    marginTop: 68,
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
