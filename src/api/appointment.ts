/**
 * 预约相关的 API
 */
import { http } from "../utils/request";
import { Appointment, AppointmentCreate, AppointmentResponse, Coach } from "./types";

/**
 * 创建预约
 * @param appointmentData - 预约信息
 * @returns 创建的预约信息
 */
export const createAppointment = (appointmentData: AppointmentCreate) => {
    return http.post<Appointment>("/api/v1/appointments/appointments/", appointmentData);
};

/**
 * 获取当前用户的预约列表
 * @param skip - 跳过的记录数
 * @param limit - 返回的最大记录数
 * @returns 预约列表
 */
export const getMyAppointments = (skip = 0, limit = 100) => {
    return http.get<AppointmentResponse[]>("/api/v1/appointments/appointments/", { skip, limit });
};

/**
 * 获取指定时间段内可用的教练列表
 * @param start - 开始时间
 * @param end - 结束时间
 * @returns 可用教练列表
 */
export const getAvailableCoaches = (start: string, end: string) => {
    return http.get<Coach[]>("/api/v1/appointments/available-coaches/", {
        appointment_start: start,
        appointment_end: end,
    });
};

/**
 * 取消预约
 * @param appointmentId - 预约ID
 * @returns 更新后的预约信息
 */
export const cancelAppointment = (appointmentId: number) => {
    return http.put<Appointment>(`/api/v1/appointments/appointments/${appointmentId}/cancel`);
}; 