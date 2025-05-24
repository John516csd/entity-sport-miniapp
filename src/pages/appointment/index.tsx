import { View } from "@tarojs/components";
import React, { useEffect, useState } from "react";
import CardSwiper, { CardItem } from "../../modules/appointment/card-swiper";
import styles from "./index.module.less";
import DateSelectorDrawer, {
    DateItem,
} from "../../modules/appointment/date-selector-drawer";
import { TimeSlot } from "@/utils";
import { getCoaches, Coach } from "@/api";
import { BASE_API_URL } from "@/constants";
import Taro from "@tarojs/taro";

const Appointment: React.FC = () => {
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [dateSelectorVisible, setDateSelectorVisible] = useState<boolean>(false);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // 获取教练列表
    const handleGetCoaches = async () => {
        try {
            setLoading(true);
            const response = await getCoaches();
            setCoaches(response);
        } catch (error) {
            console.error('获取教练列表失败', error);
        } finally {
            setLoading(false);
        }
    };

    // 组件加载时获取教练列表
    Taro.useDidShow(() => {
        handleGetCoaches();
    });

    // 将教练数据转换为卡片数据
    const cards = coaches.map(coach => ({
        id: coach.id,
        title: coach.name,
        content: coach.introduction || coach.specialization || '暂无介绍',
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

    const handleConfirmDate = (date: DateItem, timeSlot: TimeSlot) => {
        console.log("确定", date, timeSlot);
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
