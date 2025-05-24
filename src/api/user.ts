/**
 * 用户相关的 API
 */
import { http } from "../utils/request";
import { User, UserUpdate, Membership } from "./types";

/**
 * 获取当前登录用户信息
 * @returns 用户信息
 */
export const getCurrentUser = () => {
    return http.get<User>("/api/v1/users/users/me");
};

/**
 * 更新当前用户信息
 * @param userData - 要更新的用户信息
 * @returns 更新后的用户信息
 */
export const updateCurrentUser = (userData: UserUpdate) => {
    return http.put<User>("/api/v1/users/users/me", userData);
};

/**
 * 获取当前用户的会员信息
 * @returns 会员信息列表
 */
export const getUserMemberships = () => {
    return http.get<Membership[]>("/api/v1/users/users/me/memberships");
};

/**
 * 根据用户ID获取用户信息
 * @param uid - 用户ID
 * @returns 用户信息
 */
export const getUserByUid = (uid: string) => {
    return http.get<User>(`/api/v1/users/users/uid/${uid}`);
}; 