/**
 * 用户相关的 API
 */
import Taro from "@tarojs/taro";
import { http } from "../utils/request";
import { User, UserUpdate, Membership } from "./types";
import { BASE_API_URL } from "../constants";

/**
 * 获取当前登录用户信息
 * @returns 用户信息
 */
export const getCurrentUser = () => {
    return http.get<User>("/api/v1/users/me");
};

/**
 * 更新当前用户信息
 * @param userData - 要更新的用户信息
 * @returns 更新后的用户信息
 */
export const updateCurrentUser = (userData: UserUpdate) => {
    return http.post<User>("/api/v1/users/me", userData);
};

/**
 * 使用 multipart 同时上传头像和更新用户信息
 * @param avatarPath - 微信临时文件路径
 * @param userData - 要更新的用户信息  
 * @returns 更新后的用户信息
 */
export const uploadUserAvatarWithData = async (avatarPath: string, userData: UserUpdate): Promise<User> => {
    const token = Taro.getStorageSync('token');
    
    console.log("🔧 开始 multipart 上传头像和用户数据:", { avatarPath, userData });
    
    // 构建表单数据
    const formData: Record<string, any> = {};
    
    // 添加用户信息到表单数据
    if (userData.name) formData['name'] = userData.name;
    if (userData.phone) formData['phone'] = userData.phone;
    if (userData.gender !== undefined) formData['gender'] = userData.gender;
    if (userData.password) formData['password'] = userData.password;
    
    console.log("🔧 表单数据:", formData);
    console.log("🔧 头像文件路径:", avatarPath);
    
    // 直接使用微信临时文件路径上传到服务端
    const res = await Taro.uploadFile({
        url: `${BASE_API_URL}/api/v1/users/me`,
        filePath: avatarPath,
        name: 'avatar',
        formData,
        header: {
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });
    
    console.log("🔧 服务端响应:", res);
    
    if (res.statusCode === 200 || res.statusCode === 201) {
        try {
            const responseData = JSON.parse(res.data);
            if (responseData.code === 200) {
                return responseData.data;
            } else {
                throw new Error(responseData.message || '上传失败');
            }
        } catch (parseError) {
            console.error("🔧 解析响应失败:", parseError);
            console.error("🔧 原始响应数据:", res.data);
            throw new Error('服务端响应格式错误');
        }
    }
    
    throw new Error(`上传失败，状态码: ${res.statusCode}`);
};

/**
 * 获取当前用户的会员信息
 * @returns 会员信息列表
 */
export const getUserMemberships = () => {
    return http.get<Membership[]>("/api/v1/users/me/memberships");
};

/**
 * 根据用户ID获取用户信息
 * @param uid - 用户ID
 * @returns 用户信息
 */
export const getUserByUid = (uid: string) => {
    return http.get<User>(`/api/v1/users/uid/${uid}`);
}; 