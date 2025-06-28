import { createStore } from 'zustand/vanilla';

interface ModalState {
  // 存储所有打开的模态框/抽屉的关闭函数
  openModals: Map<string, () => void>;
  
  // 注册模态框
  registerModal: (id: string, closeFunction: () => void) => void;
  
  // 注销模态框
  unregisterModal: (id: string) => void;
  
  // 关闭所有模态框
  closeAllModals: () => void;
}

const store = createStore<ModalState>((set, get) => ({
  openModals: new Map(),
  
  registerModal: (id: string, closeFunction: () => void) => {
    const state = get();
    const newMap = new Map(state.openModals);
    newMap.set(id, closeFunction);
    set({ openModals: newMap });
  },
  
  unregisterModal: (id: string) => {
    const state = get();
    const newMap = new Map(state.openModals);
    newMap.delete(id);
    set({ openModals: newMap });
  },
  
  closeAllModals: () => {
    const state = get();
    // 调用所有注册的关闭函数
    state.openModals.forEach((closeFunction) => {
      try {
        closeFunction();
      } catch (error) {
        console.error('Error closing modal:', error);
      }
    });
    // 清空注册表
    set({ openModals: new Map() });
  },
}));

// 导出 store 的方法
export const useModalStore = {
  getState: store.getState,
  setState: store.setState,
  subscribe: store.subscribe,
  get registerModal() {
    return store.getState().registerModal;
  },
  get unregisterModal() {
    return store.getState().unregisterModal;
  },
  get closeAllModals() {
    return store.getState().closeAllModals;
  }
};