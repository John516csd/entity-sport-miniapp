import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { AppointmentResponse } from '@/api';
import styles from './index.module.less';
import { BASE_API_URL } from '@/constants';
import { localizeDate } from '@/utils/date';

interface AppointmentHistoryProps {
    appointments: AppointmentResponse[];
    loading?: boolean;
    onAppointmentClick?: (appointment: AppointmentResponse) => void;
    className?: string;
}

const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({
    appointments,
    loading = false,
    onAppointmentClick,
    className
}) => {
    if (loading) {
        return (
            <View className={styles.loading}>
                加载中...
            </View>
        );
    }

    if (appointments.length === 0) {
        return (
            <View className={styles.empty}>
                暂无预约记录
            </View>
        );
    }

    return (
        <View className={`${styles.container} ${className}`}>
            <Text className={styles.title}>历史预约</Text>
            <View className={styles.list}>
                {appointments.map((appointment) => (
                    <View
                        key={appointment.id}
                        className={styles.item}
                        onClick={() => onAppointmentClick?.(appointment)}
                    >
                        <Image
                            className={styles.coach_avatar}
                            src={`${BASE_API_URL}${appointment.coach.avatar_url}`}
                            mode="aspectFill"
                        />
                        <View className={styles.info}>
                            <Text className={styles.coach_name}>{appointment.coach.name}</Text>
                            <Text className={styles.time}>
                                {localizeDate(new Date(appointment.appointment_start), 'YYYY-MM-DD HH:mm')}
                            </Text>
                            <Text className={styles.status}>
                                {appointment.status === 'completed' ? '已完成' :
                                    appointment.status === 'cancelled' ? '已取消' : '进行中'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default AppointmentHistory; 