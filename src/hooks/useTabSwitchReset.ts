import { useModalStore } from '@/store/modal';

/**
 * 全局模态框管理钩子
 * 返回关闭所有模态框的函数，需要在页面级别使用
 */
export const useGlobalModalManager = () => {
  const { closeAllModals } = useModalStore;
  
  return {
    closeAllModals
  };
};