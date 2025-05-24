/**
 * 认证相关的 API
 */
import { http } from "../utils/request";
import { LoginResponse } from "./types";

/**
 * 微信登录
 * @param code - 微信登录code
 * @returns 登录响应，包含访问令牌和用户信息
 */
export const login = (code: string): Promise<LoginResponse> => {
    return http.post("/api/v1/wechat/login", {
        code,
    });
}; 