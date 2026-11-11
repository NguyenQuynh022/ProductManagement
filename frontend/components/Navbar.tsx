import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { authService } from '../services/authService';

interface NavbarProps {
  username?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ username = 'Quản lý' }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
  };

  const navItems = [
    { label: '🍃 Người mua', path: '/mobile' },
    { label: '📦 Quản lý kho', path: '/admin/products' },
    { label: '📊 Báo cáo', path: '/admin/dashboard' },
  ];

  return (
    <View style={styles.container}>
      {/* Brand logo & title - ResQ Forest Green Header */}
      <TouchableOpacity 
        style={styles.brandContainer} 
        activeOpacity={0.85}
        onPress={() => router.push('/' as any)}
      >
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>🍃</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>ResQ</Text>
          <Text style={styles.brandSub}>Store &amp; Inventory</Text>
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
    backgroundColor: '#1b4332', // ResQ Deep Forest Green
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
    flexWrap: 'wrap',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e7ede4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandSub: {
    color: '#d1fae5',
    fontSize: 10,
    fontWeight: '600',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItemActive: {
    backgroundColor: '#ffffff',
  },
  navItemText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
  navItemTextActive: {
    color: '#1b4332',
    fontWeight: '800',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  usernameText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  logoutText: {
    color: '#1b4332',
    fontSize: 11,
    fontWeight: '800',
  },
});
