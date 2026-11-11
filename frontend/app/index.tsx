import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Tự động điều hướng đến giao diện Shopee Storefront
    router.replace('/mobile' as any);
  }, []);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#ee4d2d" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ee4d2d',
  },
});
