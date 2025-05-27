import { createStore } from 'zustand/vanilla';
import { User, UserInfoWechat } from '@/api';
import Taro from '@tarojs/taro';
import DefaultAvatar from '@/assets/profile/default-avatar.png';

interface UserState {
    user: User | null;
    userInfoWechat: UserInfoWechat | null;
    isLoggedIn: boolean;
    avatar: string;
    name: string;
    setUser: (user: User | null) => void;
    setUserInfoWechat: (userInfo: UserInfoWechat | null) => void;
    login: (token: string, userInfoWechat?: UserInfoWechat, user?: User) => Promise<void>;
    logout: () => Promise<void>;
    checkLoginStatus: () => Promise<void>;
}

const store = createStore<UserState>((set) => ({
    user: null,
    userInfoWechat: null,
    isLoggedIn: false,
    avatar: DefaultAvatar,
    name: 'xxx',
    setUser: (user) => set({ user }),
    setUserInfoWechat: (userInfoWechat) => set({ userInfoWechat }),
    login: async (token, userInfoWechat, user) => {        // 保存 token 到 storage
        await Taro.setStorage({
            key: 'token',
            data: token
        });

        // 保存用户信息到 storage
        if (user) {
            await Taro.setStorage({
                key: 'userInfo',
                data: user
            });
        }
        if (userInfoWechat) {
            await Taro.setStorage({
                key: 'userInfoWechat',
                data: userInfoWechat
            });
        }

        // 更新状态
        set({
            user,
            userInfoWechat,
            isLoggedIn: true,
            avatar: userInfoWechat?.avatarUrl || DefaultAvatar,
            name: userInfoWechat?.nickName || user?.name || 'xxx'
        });
    },
    logout: async () => {
        // 清除 storage
        await Taro.removeStorage({ key: 'token' });
        await Taro.removeStorage({ key: 'userInfo' });
        await Taro.removeStorage({ key: 'userInfoWechat' });

        // 重置状态
        set({
            user: null,
            userInfoWechat: null,
            isLoggedIn: false,
            avatar: DefaultAvatar,
            name: 'xxx'
        });
    },
    checkLoginStatus: async () => {
        try {
            const tokenRes = await Taro.getStorage({ key: 'token' });
            if (tokenRes.errMsg === 'getStorage:ok') {
                // 获取用户信息
                let userInfo: User | null = null;
                let userInfoWechat: UserInfoWechat | null = null;

                try {
                    const userInfoRes = await Taro.getStorage({ key: 'userInfo' });
                    if (userInfoRes.errMsg === 'getStorage:ok') {
                        userInfo = userInfoRes.data as User;
                    }
                } catch (error) {
                    console.error('获取用户信息失败:', error);
                }

                try {
                    const userInfoWechatRes = await Taro.getStorage({ key: 'userInfoWechat' });
                    if (userInfoWechatRes.errMsg === 'getStorage:ok') {
                        userInfoWechat = userInfoWechatRes.data as UserInfoWechat;
                    }
                } catch (error) {
                    console.error('获取微信用户信息失败:', error);
                }

                set({
                    isLoggedIn: true,
                    user: userInfo,
                    userInfoWechat: userInfoWechat,
                    avatar: userInfoWechat?.avatarUrl || DefaultAvatar,
                    name: userInfoWechat?.nickName || userInfo?.name || 'xxx'
                });
            } else {
                set({
                    isLoggedIn: false,
                    user: null,
                    userInfoWechat: null,
                    avatar: DefaultAvatar,
                    name: 'xxx'
                });
            }
        } catch (err) {
            console.error('检查登录状态失败:', err);
            set({
                isLoggedIn: false,
                user: null,
                userInfoWechat: null,
                avatar: DefaultAvatar,
                name: 'xxx'
            });
        }
    }
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
    setUserInfoWechat: store.getState().setUserInfoWechat
}; 