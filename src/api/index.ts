import { http } from "../utils/request";

export const login: (code: string) => Promise<{
    access_token: string;
}> = (code: string) => {
    return http.post("/api/v1/wechat/login", {
        code,
    });
};