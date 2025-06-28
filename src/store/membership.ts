import { createStore } from 'zustand/vanilla';
import { MembershipResponse, getMyMemberships } from '@/api';

interface MembershipState {
    memberships: MembershipResponse[];
    selectedMembership: MembershipResponse | null;
    loading: boolean;
    error: string | null;
    fetchMemberships: () => Promise<void>;
    setSelectedMembership: (membership: MembershipResponse | null) => void;
}

const store = createStore<MembershipState>((set) => ({
    memberships: [],
    selectedMembership: null,
    loading: false,
    error: null,
    fetchMemberships: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMyMemberships();
            set({
                memberships: response,
                selectedMembership: response.length > 0 ? response[0] : null,
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
    }
}; 