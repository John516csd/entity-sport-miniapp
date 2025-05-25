import { View } from "@tarojs/components";
import React, { useEffect, useState } from "react";
import CardSwiper, { CardItem } from "../../modules/appointment/card-swiper";
import styles from "./index.module.less";
import DateSelectorDrawer, {
    DateItem,
} from "../../modules/appointment/date-selector-drawer";
import { TimeSlot as UTimeSlot } from "@/utils";
import { BASE_API_URL } from "@/constants";
import Taro from "@tarojs/taro";
import { Coach, getCoaches, createAppointment, TimeSlot } from "@/api";
import { useMembershipStore } from "@/store/membership";

const Appointment: React.FC = () => {
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [dateSelectorVisible, setDateSelectorVisible] = useState<boolean>(false);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { selectedMembership, fetchMemberships } = useMembershipStore.getState();

    // 获取教练列表
    const handleGetCoaches = async () => {
        try {
            setLoading(true);
            const response = await getCoaches();
            setCoaches(response);
        } catch (error) {
            console.error('获取教练列表失败', error);
            Taro.showToast({
                title: '获取教练列表失败',
                icon: 'none'
            });
        } finally {
            setLoading(false);
        }
    };

    // 组件加载时获取数据
    Taro.useDidShow(() => {
        console.log("🚀 ~ Taro.useDidShow ~ useDidShow:")
        fetchMemberships();
        handleGetCoaches();
    });

    // 将教练数据转换为卡片数据
    const cards = coaches.map(coach => ({
        id: coach.id,
        title: coach.name,
        content: coach.specialty || '暂无介绍',
        avatar: `${BASE_API_URL}${coach.avatar_url}`
    }));

    const handleCardChange = (index: number) => {
        if (coaches[index]) {
            setSelectedCoach(coaches[index]);
        }
    };

    const handleConfirmCoach = (cardItem: CardItem) => {
        const coach = coaches.find(coach => coach.id === cardItem.id);
        if (coach) {
            setSelectedCoach(coach);
            setDateSelectorVisible(true);
        }
    };

    const handleConfirmDate = async (date: DateItem, timeSlot: TimeSlot) => {
        console.log("🚀 ~ handleConfirmDate ~ timeSlot:", date, timeSlot, selectedCoach, selectedMembership)
        if (!selectedCoach || !selectedMembership) {
            return;
        }

        try {
            // 创建预约
            const response = await createAppointment({
                coach_id: selectedCoach.id,
                appointment_start: timeSlot.start,
                membership_id: selectedMembership.id
            });
            console.log("🚀 ~ handleConfirmDate ~ response:", response);

            Taro.showToast({
                title: '预约成功',
                icon: 'success',
                duration: 3000
            });

            // 关闭日期选择器
            setDateSelectorVisible(false);
        } catch (error) {
            console.error('预约失败', error);
            Taro.showToast({
                title: error.message,
                icon: 'none',
                duration: 2000
            });
        }
    };

    return (
        <View className={styles.wrapper}>
            {loading ? (
                <View className={styles.loading}>加载中...</View>
            ) : coaches.length > 0 ? (
                <CardSwiper
                    cards={cards}
                    onCardChange={handleCardChange}
                    onConfirm={handleConfirmCoach}
                />
            ) : (
                <View className={styles.empty_state}>
                    暂无可用教练
                </View>
            )}
            <DateSelectorDrawer
                selectedCoach={selectedCoach}
                visible={dateSelectorVisible}
                onClose={() => setDateSelectorVisible(false)}
                onConfirm={handleConfirmDate}
            />
        </View>
    );
};

export default Appointment;
