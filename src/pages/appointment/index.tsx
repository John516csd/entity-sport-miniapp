import { View } from "@tarojs/components";
import React, { useEffect, useState } from "react";
import CardSwiper, { CardItem } from "../../modules/appointment/card-swiper";
import MembershipCardSelector from "../../components/membership-card-selector";
import styles from "./index.module.less";
import DateSelectorDrawer, {
    DateItem,
} from "../../modules/appointment/date-selector-drawer";
import { TimeSlot as UTimeSlot } from "@/utils";
import { BASE_API_URL } from "@/constants";
import Taro from "@tarojs/taro";
import { Coach, getCoaches, createAppointment, TimeSlot, MembershipResponse } from "@/api";
import { useMembershipStore } from "@/store/membership";
import { useAppointmentStore } from "@/store/appointment";
import { useStore } from "@/hooks/useStore";
import { useGlobalModalManager } from "@/hooks/useTabSwitchReset";

// 预约流程步骤
enum AppointmentStep {
    CARD_SELECTION = 'card_selection',
    COACH_SELECTION = 'coach_selection',
    DATE_SELECTION = 'date_selection'
}

const Appointment: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<AppointmentStep | null>(null); // 初始为 null，等待数据加载
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [selectedMembershipForBooking, setSelectedMembershipForBooking] = useState<MembershipResponse | null>(null);
    const [dateSelectorVisible, setDateSelectorVisible] = useState<boolean>(false);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [membershipLoading, setMembershipLoading] = useState<boolean>(true); // 追踪会员卡加载状态
    const [resetTrigger, setResetTrigger] = useState<number>(0);
    // 使用响应式store，数据更新时自动重新渲染
    const membershipState = useStore(useMembershipStore);
    const { fetchMemberships, getValidMemberships, setBookingSelectedMembership } = useMembershipStore.getState();
    const { fetchAppointments } = useAppointmentStore.getState();

    // 使用全局模态框管理（只关闭弹窗）
    const { closeAllModals } = useGlobalModalManager();
    
    // 页面隐藏时关闭所有模态框
    Taro.useDidHide(() => {
        closeAllModals();
    });

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

    // 重置状态到初始状态
    const resetToInitialState = () => {
        setCurrentStep(null); // 重置为 null，等待数据加载
        setSelectedCoach(null);
        setSelectedMembershipForBooking(null);
        setDateSelectorVisible(false);
        setMembershipLoading(true);
        // 触发日期选择器内部状态重置
        setResetTrigger(prev => prev + 1);
    };

    // 根据有效会员卡数量决定初始步骤
    const determineInitialStep = () => {
        const validMemberships = getValidMemberships();
        console.log("🚀 ~ determineInitialStep ~ validMemberships:", validMemberships);
        
        if (validMemberships.length === 0) {
            setCurrentStep(AppointmentStep.CARD_SELECTION);
        } else if (validMemberships.length === 1) {
            // 只有一张有效卡，自动选择并跳到教练选择
            setSelectedMembershipForBooking(validMemberships[0]);
            setBookingSelectedMembership(validMemberships[0]);
            setCurrentStep(AppointmentStep.COACH_SELECTION);
        } else {
            // 多张卡，需要用户选择
            setCurrentStep(AppointmentStep.CARD_SELECTION);
        }
        setMembershipLoading(false);
    };

    // 组件加载时获取数据和重置状态
    Taro.useDidShow(() => {
        console.log("🚀 ~ Taro.useDidShow ~ useDidShow:")
        // 每次进入预约页面时重置预约相关状态（不影响登录状态）
        resetToInitialState();
        
        // 异步加载会员卡数据
        fetchMemberships().then(() => {
            console.log("🚀 ~ fetchMemberships completed");
            determineInitialStep();
        }).catch((error) => {
            console.error("🚀 ~ fetchMemberships failed:", error);
            setMembershipLoading(false);
            setCurrentStep(AppointmentStep.CARD_SELECTION);
        });
        
        handleGetCoaches();
    });

    // 监听会员卡数据变化，但只在初次加载时使用
    useEffect(() => {
        if (membershipLoading && membershipState.memberships.length >= 0) {
            determineInitialStep();
        }
    }, [membershipState.memberships, membershipLoading]);

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

    // 处理会员卡选择
    const handleMembershipCardChange = (membership: MembershipResponse) => {
        setSelectedMembershipForBooking(membership);
        setBookingSelectedMembership(membership);
    };

    const handleConfirmMembershipCard = (membership: MembershipResponse) => {
        setSelectedMembershipForBooking(membership);
        setBookingSelectedMembership(membership);
        setCurrentStep(AppointmentStep.COACH_SELECTION);
    };

    const handleConfirmDate = async (date: DateItem, timeSlot: TimeSlot) => {
        console.log("🚀 ~ handleConfirmDate ~ timeSlot:", date, timeSlot, selectedCoach, selectedMembershipForBooking)
        if (!selectedCoach || !selectedMembershipForBooking) {
            return;
        }

        try {
            // 创建预约
            const response = await createAppointment({
                coach_id: selectedCoach.id,
                appointment_start: timeSlot.start,
                membership_id: selectedMembershipForBooking.id
            });
            console.log("🚀 ~ handleConfirmDate ~ response:", response);

            Taro.showToast({
                title: '预约成功',
                icon: 'success',
                duration: 3000
            });

            // 刷新会员卡和预约数据
            try {
                await Promise.all([
                    fetchMemberships(), // 刷新会员卡数据（次数会减少）
                    fetchAppointments() // 刷新预约数据
                ]);
                console.log('数据刷新成功');
            } catch (refreshError) {
                console.error('数据刷新失败:', refreshError);
                // 数据刷新失败不影响用户体验，只在控制台记录
            }

            // 重置状态到初始状态
            resetToInitialState();
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
            {(loading || membershipLoading || currentStep === null) ? (
                <View className={styles.loading}>加载中...</View>
            ) : currentStep === AppointmentStep.CARD_SELECTION ? (
                <MembershipCardSelector
                  memberships={getValidMemberships()}
                  selectedMembership={membershipState.bookingSelectedMembership}
                  onCardChange={handleMembershipCardChange}
                  onConfirm={handleConfirmMembershipCard}
                />
            ) : currentStep === AppointmentStep.COACH_SELECTION && coaches.length > 0 ? (
                <CardSwiper
                  cards={cards}
                  onCardChange={handleCardChange}
                  onConfirm={handleConfirmCoach}
                />
            ) : (
                <View className={styles.empty_state}>
                    {currentStep === AppointmentStep.CARD_SELECTION ? '暂无可用会员卡' : '暂无可用教练'}
                </View>
            )}
            <DateSelectorDrawer
              selectedCoach={selectedCoach}
              visible={dateSelectorVisible}
              onClose={() => setDateSelectorVisible(false)}
              onConfirm={handleConfirmDate}
              resetTrigger={resetTrigger}
            />
        </View>
    );
};

export default Appointment;
