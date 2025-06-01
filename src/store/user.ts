import { createStore } from "zustand/vanilla";
import { User, UserInfoWechat } from "@/api";
import Taro from "@tarojs/taro";

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  login: (token: string, user?: User) => Promise<void>;
  logout: () => Promise<void>;
  checkLoginStatus: () => Promise<void>;
}

const store = createStore<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) => set({ user }),
  login: async (token, user) => {
    // 保存 token 到 storage
    await Taro.setStorage({
      key: "token",
      data: token,
    });

    // 保存用户信息到 storage
    if (user) {
      await Taro.setStorage({
        key: "userInfo",
        data: user,
      });
    }

    // 更新状态
    set({
      user,
      isLoggedIn: true,
    });
  },
  logout: async () => {
    // 清除 storage
    await Taro.removeStorage({ key: "token" });
    await Taro.removeStorage({ key: "userInfo" });

    // 重置状态
    set({
      user: null,
      isLoggedIn: false,
    });
  },
  checkLoginStatus: async () => {
    try {
      const tokenRes = await Taro.getStorage({ key: "token" });
      if (tokenRes.errMsg === "getStorage:ok") {
        // 获取用户信息
        let userInfo: User | null = null;

        try {
          const userInfoRes = await Taro.getStorage({ key: "userInfo" });
          if (userInfoRes.errMsg === "getStorage:ok") {
            userInfo = userInfoRes.data as User;
          }
        } catch (error) {
          console.error("获取用户信息失败:", error);
        }

        set({
          isLoggedIn: true,
          user: userInfo,
        });
      } else {
        set({
          isLoggedIn: false,
          user: null,
        });
      }
    } catch (err) {
      console.error("检查登录状态失败:", err);
      set({
        isLoggedIn: false,
        user: null,
      });
    }
  },
}));

// 导出 store 的 getState 和 setState 方法
export const useUserStore = {
  getState: store.getState,
  setState: store.setState,
  subscribe: store.subscribe,
  login: store.getState().login,
  logout: store.getState().logout,
  checkLoginStatus: store.getState().checkLoginStatus,
  setUser: store.getState().setUser,
};
