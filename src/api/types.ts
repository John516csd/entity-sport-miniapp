/**
 * 用户相关类型定义
 */

import { CardType } from "@/types";

/**
 * 用户信息接口
 */
export interface User {
  id: number; // 用户ID
  uid: string; // 用户唯一标识
  name: string | null; // 用户名称
  phone: string | null; // 手机号码
  avatar_url: string | null; // 头像URL
  gender: number | null; // 性别
  openid: string; // 微信openid
  unionid: string | null; // 微信unionid
  is_admin: boolean; // 是否为管理员
  created_at: string; // 创建时间
}

/**
 * 用户信息更新接口
 */
export interface UserUpdate {
  name?: string; // 用户名称
  phone?: string; // 手机号码
  avatar_url?: string; // 头像URL
  gender?: number; // 性别
  password?: string; // 密码
}

/**
 * 微信用户信息接口
 */
export interface UserInfoWechat {
  avatarUrl: string; // 头像URL
  city: string; // 城市
  country: string; // 国家
  gender: number; // 性别
  is_demote?: boolean; // 是否降级
  language: string; // 语言
  nickName: string; // 昵称
  province: string; // 省份
}

/**
 * 教练相关类型定义
 */

/**
 * 教练信息接口
 */
export interface Coach {
  id: number; // 教练ID
  name: string; // 教练名称
  avatar_url: string; // 头像URL
  phone: string; // 手机号码
  specialty: string; // 专长
}

/**
 * 时间段接口
 */
export interface TimeSlot {
  start: string; // 开始时间
  end: string; // 结束时间
  booked_count: number; // 已预约数量
}

/**
 * 会员相关类型定义
 */

/**
 * 会员信息接口
 */
export interface Membership {
  id: number; // 会员ID
  uid: string; // 用户ID
  type_id: CardType; // 会员类型ID
  purchased_at: string; // 购买时间
  expired_at: string; // 过期时间
  status: string; // 状态
}

/**
 * 会员信息响应接口
 */
export interface MembershipResponse extends Membership {
  remaining_sessions: number; // 剩余课程数
}

/**
 * 会员请假创建接口
 */
export interface MembershipLeaveCreate {
  start_date: string; // 开始日期
  end_date: string; // 结束日期
  reason?: string; // 请假原因
}

/**
 * 会员请假响应接口
 */
export interface MembershipLeaveResponse {
  id: number; // 请假ID
  membership_id: number; // 会员ID
  start_date: string; // 开始日期
  end_date: string; // 结束日期
  reason?: string; // 请假原因
  status?: string; // 状态
  created_at?: string; // 创建时间
}

/**
 * 会员合同响应接口
 */
export interface MembershipContractResponse {
  id: number; // 合同ID
  user_id: string; // 用户ID
  contract_number: string; // 合同编号
  signing_date: string; // 签署日期
  total_amount: number; // 总金额
  status: string; // 状态
}

/**
 * 预约相关类型定义
 */

/**
 * 预约创建接口
 */
export interface AppointmentCreate {
  coach_id: number; // 教练ID
  appointment_start: string; // 预约开始时间
  membership_id: number; // 会员ID
}

/**
 * 预约信息接口
 */
export interface Appointment {
  id: number; // 预约ID
  uid: string; // 用户ID
  coach_id: number; // 教练ID
  membership_id: number; // 会员卡ID
  appointment_start: string; // 预约开始时间
  appointment_end: string; // 预约结束时间
  status: string; // 状态
  cancellation_note?: string; // 取消原因
}

/**
 * 会员卡类型接口
 */
export interface MembershipType {
  id: number;
  name: string;
  total_sessions: number;
  validity_days: number;
  max_leave_count: number;
  max_leave_duration: number;
}

/**
 * 会员卡详细信息响应接口
 */
export interface MembershipResponseWithDetails extends Membership {
  user: User;
  type: MembershipType;
  leaves: any[]; // 请假记录
}

/**
 * 预约信息响应接口
 */
export interface AppointmentResponse extends Appointment {
  user: User; // 用户信息
  coach: Coach; // 教练信息
  membership: MembershipResponseWithDetails;
}

/**
 * 认证相关类型定义
 */

/**
 * 登录响应接口
 */
export interface LoginResponse {
  access_token: string; // 访问令牌
  user_info: User; // 用户信息
}
