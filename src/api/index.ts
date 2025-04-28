import { http } from "../utils/request";

export const login: (code: string) => Promise<{
    access_token: string;
}> = (code: string) => {
    return http.post("/api/v1/wechat/login", {
        code,
    });
};

// User endpoints
export const getCurrentUser = () => {
    return http.get<User>("/api/v1/users/users/me");
};

export const updateCurrentUser = (userData: UserUpdate) => {
    return http.put<User>("/api/v1/users/users/me", userData);
};

export const getUserMemberships = () => {
    return http.get<Membership[]>("/api/v1/users/users/me/memberships");
};

export const getUserByUid = (uid: string) => {
    return http.get<User>(`/api/v1/users/users/uid/${uid}`);
};

// Coach endpoints
export const getCoaches = (skip = 0, limit = 100) => {
    return http.get<Coach[]>("/api/v1/coaches/coaches/", { skip, limit });
};

export const getCoachById = (coachId: number) => {
    return http.get<Coach>(`/api/v1/coaches/coaches/${coachId}`);
};

export const getCoachAvailability = (coachId: number, date: string) => {
    return http.get<TimeSlot[]>(`/api/v1/coaches/coaches/${coachId}/availability`, { date_param: date });
};

// Membership endpoints
export const getMyMemberships = () => {
    return http.get<MembershipResponse[]>("/api/v1/memberships/my");
};

export const getMembershipById = (membershipId: number) => {
    return http.get<MembershipResponse>(`/api/v1/memberships/${membershipId}`);
};

export const createMembershipLeave = (membershipId: number, leaveData: MembershipLeaveCreate) => {
    return http.post<MembershipLeaveResponse>(`/api/v1/memberships/${membershipId}/leaves`, leaveData);
};

export const getMembershipLeaves = (membershipId: number) => {
    return http.get<MembershipLeaveResponse[]>(`/api/v1/memberships/${membershipId}/leaves`);
};

// Appointment endpoints
export const createAppointment = (appointmentData: AppointmentCreate) => {
    return http.post<Appointment>("/api/v1/appointments/appointments/", appointmentData);
};

export const getMyAppointments = (skip = 0, limit = 100) => {
    return http.get<AppointmentResponse[]>("/api/v1/appointments/appointments/", { skip, limit });
};

export const getAvailableCoaches = (start: string, end: string) => {
    return http.get<Coach[]>("/api/v1/appointments/available-coaches/", {
        appointment_start: start,
        appointment_end: end,
    });
};

export const cancelAppointment = (appointmentId: number) => {
    return http.put<Appointment>(`/api/v1/appointments/appointments/${appointmentId}/cancel`);
};

// Contract endpoints
export const getMyContracts = (skip = 0, limit = 100) => {
    return http.get<MembershipContractResponse[]>("/api/v1/contracts/my-contracts/", { skip, limit });
};

export const getContractById = (contractId: number) => {
    return http.get<MembershipContractResponse>(`/api/v1/contracts/${contractId}`);
};

// Types for API response structures
export interface User {
    uid: string;
    id: number;
    name?: string;
    phone?: string;
    avatar_url?: string;
    gender?: number;
    memberships?: MembershipResponse[];
    leaves?: MembershipLeaveResponse[];
}

export interface UserUpdate {
    name?: string;
    phone?: string;
    avatar_url?: string;
    gender?: number;
    password?: string;
}

export interface Coach {
    id: number;
    name: string;
    avatar_url?: string;
    introduction?: string;
    specialization?: string;
}

export interface TimeSlot {
    start: string;
    end: string;
    booked_count: number;
}

export interface Membership {
    id: number;
    uid: string;
    type_id: number;
    purchased_at: string;
    expired_at: string;
    status: string;
}

export interface MembershipResponse extends Membership {
    remaining_sessions: number;
}

export interface MembershipLeaveCreate {
    start_date: string;
    end_date: string;
    reason?: string;
}

export interface MembershipLeaveResponse {
    id: number;
    membership_id: number;
    start_date: string;
    end_date: string;
    reason?: string;
    status?: string;
    created_at?: string;
}

export interface AppointmentCreate {
    coach_id: number;
    appointment_start: string;
    membership_id: number;
}

export interface Appointment {
    id: number;
    user_id: string;
    coach_id: number;
    appointment_start: string;
    appointment_end: string;
    status: string;
    created_at: string;
}

export interface AppointmentResponse extends Appointment {
    coach: Coach;
}

export interface MembershipContractResponse {
    id: number;
    user_id: string;
    contract_number: string;
    signing_date: string;
    total_amount: number;
    status: string;
}