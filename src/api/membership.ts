/**
 * 会员相关的 API
 */
import { http } from "../utils/request";
import { 
    MembershipResponse, 
    MembershipLeaveCreate, 
    MembershipLeaveResponse,
    MembershipContractResponse 
} from "./types";

/**
 * 获取当前用户的会员信息
 * @returns 会员信息列表
 */
export const getMyMemberships = () => {
    return http.get<MembershipResponse[]>("/api/v1/memberships/my");
};

/**
 * 根据ID获取会员信息
 * @param membershipId - 会员ID
 * @returns 会员信息
 */
export const getMembershipById = (membershipId: number) => {
    return http.get<MembershipResponse>(`/api/v1/memberships/${membershipId}`);
};

/**
 * 创建会员请假申请
 * @param membershipId - 会员ID
 * @param leaveData - 请假信息
 * @returns 请假申请信息
 */
export const createMembershipLeave = (membershipId: number, leaveData: MembershipLeaveCreate) => {
    return http.post<MembershipLeaveResponse>(`/api/v1/memberships/${membershipId}/leaves`, leaveData);
};

/**
 * 获取会员的请假记录
 * @param membershipId - 会员ID
 * @returns 请假记录列表
 */
export const getMembershipLeaves = (membershipId: number) => {
    return http.get<MembershipLeaveResponse[]>(`/api/v1/memberships/${membershipId}/leaves`);
};

/**
 * 获取当前用户的合同列表
 * @param skip - 跳过的记录数
 * @param limit - 返回的最大记录数
 * @returns 合同列表
 */
export const getMyContracts = (skip = 0, limit = 100) => {
    return http.get<MembershipContractResponse[]>("/api/v1/contracts/my-contracts/", { skip, limit });
};

/**
 * 根据ID获取合同信息
 * @param contractId - 合同ID
 * @returns 合同信息
 */
export const getContractById = (contractId: number) => {
    return http.get<MembershipContractResponse>(`/api/v1/contracts/${contractId}`);
}; 