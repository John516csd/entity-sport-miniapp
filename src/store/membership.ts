import { createStore } from 'zustand/vanilla';
import { MembershipResponse, getMyMemberships } from '@/api';

interface MembershipState {
    memberships: MembershipResponse[];
    selectedMembership: MembershipResponse | null;
    bookingSelectedMembership: MembershipResponse | null; // 预约时选择的会员卡
    loading: boolean;
    error: string | null;
    fetchMemberships: () => Promise<void>;
    setSelectedMembership: (membership: MembershipResponse | null) => void;
    setBookingSelectedMembership: (membership: MembershipResponse | null) => void;
    getValidMemberships: () => MembershipResponse[]; // 获取有效的会员卡
}

const store = createStore<MembershipState>((set, get) => ({
    memberships: [],
    selectedMembership: null,
    bookingSelectedMembership: null,
    loading: false,
    error: null,
    fetchMemberships: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMyMemberships();
            const validMemberships = response.filter(membership => 
                membership.remaining_sessions > 0 && 
                new Date(membership.expired_at) > new Date()
            );
            set({
                memberships: response,
                selectedMembership: response.length > 0 ? response[0] : null,
                // 自动选择第一个有效会员卡用于预约
                bookingSelectedMembership: validMemberships.length > 0 ? validMemberships[0] : null,
                loading: false
            });
        } catch (error) {
            set({
                error: '获取会员卡列表失败',
                loading: false
            });
            throw error;
        }
    },
    setSelectedMembership: (membership) => set({ selectedMembership: membership }),
    setBookingSelectedMembership: (membership) => set({ bookingSelectedMembership: membership }),
    getValidMemberships: () => {
        const { memberships } = get();
        return memberships.filter(membership => 
            membership.remaining_sessions > 0 && 
            new Date(membership.expired_at) > new Date()
        );
    },
}));

// 导出 store 的 getState 和 setState 方法
export const useMembershipStore = {
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
    get fetchMemberships() {
        return store.getState().fetchMemberships;
    },
    get setSelectedMembership() {
        return store.getState().setSelectedMembership;
    },
    get setBookingSelectedMembership() {
        return store.getState().setBookingSelectedMembership;
    },
    get getValidMemberships() {
        return store.getState().getValidMemberships;
    }
}; 