import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Product } from '../types/product';

interface DeleteConfirmModalProps {
  visible: boolean;
  product: Product | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  product,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>⚠️</Text>
          </View>
          <Text style={styles.title}>Xác Nhận Xóa Sản Phẩm</Text>
          <Text style={styles.message}>
            Bạn có chắc chắn muốn xóa sản phẩm{' '}
            <Text style={styles.productName}>"{product.name}"</Text> không?
          </Text>
          <Text style={styles.warning}>
            Lưu ý: Thao tác này sẽ xóa vĩnh viễn sản phẩm khỏi cơ sở dữ liệu MongoDB và không thể hoàn tác!
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.deleteText}>Xác nhận xóa</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  box: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
    maxWidth: 440,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
  },
  productName: {
    fontWeight: '700',
    color: '#ef4444',
  },
  warning: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  deleteText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});

