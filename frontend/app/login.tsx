import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await authService.login(username, password);
      if (res.success) {
        router.replace('/admin/products');
      } else {
        setError(res.user?.role || 'Đăng nhập không thành công.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể kết nối máy chủ.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Header Quản Lý Bán Hàng */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>🛍️</Text>
            </View>
            <Text style={styles.title}>Quản Lý Bán Hàng</Text>
            <Text style={styles.subtitle}>Đăng nhập phân hệ quản trị viên (Admin)</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên đăng nhập</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Nhập username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>ĐĂNG NHẬP QUẢN TRỊ</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f5', // Soft Sage Cream
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e8ece6',
    padding: 30,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e7ede4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 26,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1b4332',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  loginBtn: {
    backgroundColor: '#1b4332', // Deep Forest Green
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  loginBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
