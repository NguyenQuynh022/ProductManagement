import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { authService } from '../services/authService';

interface NavbarProps {
  username?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ username = 'Admin' }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
  };

  const navItems = [
    { label: '📊 Tổng quan', path: '/admin/dashboard' },
    { label: '📦 Quản lý sản phẩm', path: '/admin/products' },
    { label: '📱 Giao diện Mobile', path: '/mobile' },
  ];

  return (
    <View style={styles.container}>
      {/* Brand logo & title */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>PM</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>ProductManagement</Text>
          <Text style={styles.brandSub}>Hệ Thống Quản Trị Phân Hệ Admin</Text>
        </View>
      </View>

      {/* Navigation items */}
      <View style={styles.navLinks}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User profile & Logout */}
      <View style={styles.userSection}>
        <View style={styles.userBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.usernameText}>{username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navItemActive: {
    backgroundColor: '#334155',
  },
  navItemText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  navItemTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  usernameText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
