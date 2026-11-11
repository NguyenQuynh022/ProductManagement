import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header trên cùng giống ResQ */}
        <View style={styles.topHeader}>
          <Text style={styles.brandTitle}>ResQ</Text>
          <Text style={styles.brandSub}>PRODUCT & STORE</Text>
        </View>

        {/* Khối Hero minh họa với 2 thẻ con bay bổng */}
        <View style={styles.heroBox}>
          <View style={styles.heroMiniCardLeft}>
            <Text style={styles.heroMiniIcon}>🍃</Text>
            <Text style={styles.heroMiniText}>Xem sản phẩm</Text>
          </View>

          <View style={styles.heroMiniCardRight}>
            <Text style={styles.heroMiniIconRight}>🏪</Text>
            <Text style={styles.heroMiniTextRight}>Quản lý kho</Text>
          </View>
        </View>

        {/* Tiêu đề & Giới thiệu */}
        <View style={styles.introSection}>
          <Text style={styles.mainHeading}>Sản phẩm tốt. Giá hợp lý.</Text>
          <Text style={styles.subHeading}>
            Khám phá danh sách sản phẩm chất lượng hoặc quản lý, đăng bán và tải ảnh sản phẩm lên hệ thống.
          </Text>

          <Text style={styles.questionText}>Bạn muốn bắt đầu với vai trò nào?</Text>
        </View>

        {/* Danh sách 2 vai trò chọn lựa chuẩn thiết kế ResQ */}
        <View style={styles.rolesContainer}>
          {/* Vai trò 1: Người mua / Khách xem */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.85}
            onPress={() => router.push('/mobile' as any)}
          >
            <View style={styles.roleIconCircle}>
              <Text style={styles.roleIcon}>🍃</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Tôi là người mua (Buyer)</Text>
              <Text style={styles.roleDesc}>Xem danh mục sản phẩm, chi tiết và mua sắm</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Vai trò 2: Người bán / Quản trị viên */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.85}
            onPress={() => router.push('/admin/products' as any)}
          >
            <View style={styles.roleIconCircle}>
              <Text style={styles.roleIcon}>🏪</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Tôi là người bán (Seller / Admin)</Text>
              <Text style={styles.roleDesc}>Thêm sản phẩm, tải ảnh lên và quản lý kho hàng</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Footer text */}
        <View style={styles.footer}>
          <Text style={styles.footerNote}>Bạn có thể chuyển đổi vai trò bất cứ lúc nào trong menu.</Text>
          <Text style={styles.footerLinks}>Điều khoản dịch vụ  •  Chính sách bảo mật</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1b4332', // Deep Forest Green
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1.2,
  },
  heroBox: {
    backgroundColor: '#e7ede4', // Soft Sage Green tint
    borderRadius: 28,
    height: 240,
    position: 'relative',
    marginBottom: 28,
    overflow: 'hidden',
  },
  heroMiniCardLeft: {
    position: 'absolute',
    left: 20,
    bottom: 24,
    width: 140,
    height: 140,
    backgroundColor: '#f1f5ee',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  heroMiniIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  heroMiniText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b4332',
  },
  heroMiniCardRight: {
    position: 'absolute',
    right: 20,
    top: 24,
    width: 148,
    height: 148,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroMiniIconRight: {
    fontSize: 36,
    marginBottom: 8,
  },
  heroMiniTextRight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b4332',
  },
  introSection: {
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  rolesContainer: {
    gap: 14,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e8ece6',
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  roleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleIcon: {
    fontSize: 22,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  chevron: {
    fontSize: 26,
    color: '#9ca3af',
    fontWeight: '300',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerLinks: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
