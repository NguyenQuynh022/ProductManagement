import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { authService } from '../services/authService';

interface NavbarProps {
  username?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ username = 'Người bán' }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
  };

  const navItems = [
    { label: '🛍️ Cửa hàng', path: '/mobile' },
    { label: '📦 Quản lý SP', path: '/admin/products' },
    { label: '📊 Doanh thu', path: '/admin/dashboard' },
  ];

  return (
    <View style={styles.container}>
      {/* Brand logo & title - Shopee Orange Header */}
      <TouchableOpacity 
        style={styles.brandContainer} 
        activeOpacity={0.85}
        onPress={() => router.push('/mobile' as any)}
      >
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>Shopee</Text>
          <Text style={styles.brandSub}>Kênh Quản Lý</Text>
        </View>
      </TouchableOpacity>

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
          <Text style={styles.usernameText}>👤 {username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Thoát</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ee4d2d', // Shopee Signature Orange
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ee4d2d',
    fontWeight: '900',
    fontSize: 22,
    marginTop: -2,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandSub: {
    color: '#ffe5df',
    fontSize: 10,
    fontWeight: '600',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  navItemActive: {
    backgroundColor: '#ffffff',
  },
  navItemText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  navItemTextActive: {
    color: '#ee4d2d',
    fontWeight: '800',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usernameText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logoutText: {
    color: '#ee4d2d',
    fontSize: 11,
    fontWeight: '700',
  },
});
