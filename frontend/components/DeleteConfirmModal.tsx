import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Product } from '../types/product';

interface DeleteConfirmModalProps {
  visible: boolean;
  product?: Product | null;
  productName?: string;
  loading: boolean;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  product,
  productName,
  loading,
  onCancel,
  onClose,
  onConfirm,
}) => {
  const name = productName || product?.name || 'sản phẩm này';
  const handleClose = onCancel || onClose || (() => {});

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.iconText}>🗑️</Text>
          <Text style={styles.title}>Xóa sản phẩm</Text>
          <Text style={styles.message}>
            Bạn có chắc chắn muốn xóa <Text style={styles.productName}>"{name}"</Text> không?
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.deleteText}>Xác nhận</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  box: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    maxWidth: 360,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconText: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  productName: {
    fontWeight: '700',
    color: '#ee4d2d',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: '#ee4d2d', // Shopee Red Orange
    alignItems: 'center',
  },
  deleteText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
