/**
 * 教练相关的 API
 */
import { http } from "../utils/request";
import { Coach, TimeSlot } from "./types";

/**
 * 获取教练列表
 * @param skip - 跳过的记录数
 * @param limit - 返回的最大记录数
 * @returns 教练列表
 */
export const getCoaches = (skip = 0, limit = 100) => {
    return http.get<Coach[]>("/api/v1/coaches/", { skip, limit });
};

/**
 * 根据ID获取教练信息
 * @param coachId - 教练ID
 * @returns 教练信息
 */
export const getCoachById = (coachId: number) => {
    return http.get<Coach>(`/api/v1/coaches/${coachId}`);
};

/**
 * 获取教练在指定日期的可用时间段
 * @param coachId - 教练ID
 * @param date - 日期
 * @returns 可用时间段列表
 */
export const getCoachAvailability = (coachId: number, date: string) => {
    return http.get<TimeSlot[]>(`/api/v1/coaches/${coachId}/availability`, { date: date });
}; 