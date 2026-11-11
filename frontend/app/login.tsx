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
          {/* Header Shopee */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.title}>Shopee</Text>
            <Text style={styles.subtitle}>Kênh Người Bán &amp; Quản Lý</Text>
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
                placeholder="Tên đăng nhập"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>

            {/* Login Button Shopee Orange */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>ĐĂNG NHẬP</Text>
              )}
            </TouchableOpacity>

            {/* Quick access to Storefront */}
            <TouchableOpacity
              style={styles.storefrontBtn}
              onPress={() => router.push('/mobile' as any)}
            >
              <Text style={styles.storefrontText}>🛍️ Đến trang mua sắm Shopee</Text>
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
    backgroundColor: '#ee4d2d', // Shopee Signature Orange
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#ee4d2d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#ee4d2d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: -2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ee4d2d',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffc2c2',
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#ee4d2d',
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  loginBtn: {
    backgroundColor: '#ee4d2d', // Shopee Orange
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#ee4d2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  loginBtnDisabled: {
    backgroundColor: '#f5a897',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  storefrontBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 6,
  },
  storefrontText: {
    fontSize: 12,
    color: '#ee4d2d',
    fontWeight: '600',
  },
});
