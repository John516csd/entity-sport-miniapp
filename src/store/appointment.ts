import { createStore } from 'zustand/vanilla';
import { AppointmentResponse, getMyAppointments } from '@/api';

interface AppointmentState {
    appointments: AppointmentResponse[];
    loading: boolean;
    error: string | null;
    fetchAppointments: () => Promise<void>;
}

const store = createStore<AppointmentState>((set) => ({
    appointments: [],
    loading: false,
    error: null,
    fetchAppointments: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMyAppointments();
            set({
                appointments: response,
                loading: false
            });
        } catch (error) {
            set({
                error: '获取预约列表失败',
                loading: false
            });
            throw error;
        }
    }
}));

export const useAppointmentStore = {
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
    fetchAppointments: store.getState().fetchAppointments
}; 