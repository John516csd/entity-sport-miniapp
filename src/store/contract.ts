/**
 * 合同状态管理
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { MembershipContractResponse } from '../api/types';
import { getMyContracts, getMyContractDetail } from '../api/membership';

interface ContractState {
  contracts: MembershipContractResponse[];
  currentContract: MembershipContractResponse | null;
  loading: boolean;
  error: string | null;
}

interface ContractActions {
  fetchContracts: () => Promise<void>;
  fetchContractDetail: (contractId: number) => Promise<void>;
  clearCurrentContract: () => void;
  clearError: () => void;
}

export type ContractStore = ContractState & ContractActions;

export const useContractStore = create<ContractStore>()(
  persist(
    (set, get) => ({
      // 状态
      contracts: [],
      currentContract: null,
      loading: false,
      error: null,

      // 操作
      fetchContracts: async () => {
        set({ loading: true, error: null });
        try {
          const response = await getMyContracts();
          
          // response 应该直接是数组，因为 request 拦截器已经解包了 data
          const contracts = Array.isArray(response) ? response : [];
          
          set({ 
            contracts,
            loading: false 
          });
        } catch (error: any) {
          console.error('获取合同列表失败:', error);
          
          let errorMessage = '获取合同列表失败';
          
          // 处理不同类型的错误
          if (error?.message) {
            if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
              errorMessage = '网络连接失败，请检查网络后重试';
            } else if (error.message.includes('timeout')) {
              errorMessage = '请求超时，请重试';
            } else {
              errorMessage = error.message;
            }
          }
          
          set({ 
            contracts: [], // 确保出错时也有默认值
            error: errorMessage, 
            loading: false 
          });
          
          // 显示用户友好的错误提示
          Taro.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000
          });
        }
      },

      fetchContractDetail: async (contractId: number) => {
        set({ loading: true, error: null });
        try {
          const response = await getMyContractDetail(contractId);
          
          // response 应该直接是对象，因为 request 拦截器已经解包了 data
          set({ 
            currentContract: response || null,
            loading: false 
          });
        } catch (error: any) {
          console.error('获取合同详情失败:', error);
          
          let errorMessage = '获取合同详情失败';
          
          // 处理不同类型的错误
          if (error?.message) {
            if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
              errorMessage = '网络连接失败，请检查网络后重试';
            } else if (error.message.includes('timeout')) {
              errorMessage = '请求超时，请重试';
            } else {
              errorMessage = error.message;
            }
          }
          
          set({ 
            currentContract: null,
            error: errorMessage, 
            loading: false 
          });
          
          // 显示用户友好的错误提示
          Taro.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000
          });
        }
      },

      clearCurrentContract: () => {
        set({ currentContract: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'contract-storage-v2', // 修改版本号，清除旧缓存
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          return Taro.getStorageSync(name);
        },
        setItem: (name: string, value: string) => {
          return Taro.setStorageSync(name, value);
        },
        removeItem: (name: string) => {
          return Taro.removeStorageSync(name);
        },
      })),
      partialize: (state) => ({
        contracts: state.contracts,
      }),
    }
  )
);