import { useEffect, useCallback } from 'react';
import { useModalStore } from '@/store/modal';

/**
 * 模态框管理钩子
 * 用于自动注册和注销模态框的关闭函数
 */
export const useModalManager = (
  modalId: string,
  isVisible: boolean,
  closeFunction: () => void
) => {
  const { registerModal, unregisterModal } = useModalStore;

  const memoizedCloseFunction = useCallback(() => {
    closeFunction();
  }, [closeFunction]);

  useEffect(() => {
    if (isVisible) {
      // 模态框打开时注册关闭函数
      registerModal(modalId, memoizedCloseFunction);
    } else {
      // 模态框关闭时注销关闭函数
      unregisterModal(modalId);
    }

    // 组件卸载时确保注销
    return () => {
      unregisterModal(modalId);
    };
  }, [modalId, isVisible, memoizedCloseFunction, registerModal, unregisterModal]);

  // 返回一个增强的关闭函数，会自动注销
  const enhancedCloseFunction = useCallback(() => {
    unregisterModal(modalId);
    closeFunction();
  }, [modalId, closeFunction, unregisterModal]);

  return enhancedCloseFunction;
};