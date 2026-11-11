import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Chuyển thẳng vào phân hệ Admin Quản Trị Sản Phẩm Bán Hàng
    router.replace('/admin/products' as any);
  }, []);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1b4332" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});
