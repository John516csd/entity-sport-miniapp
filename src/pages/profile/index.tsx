import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import VipCard from '../../components/vip-card';
import WeappLoginButton from '../../components/wx-login-wrapper';
import AppointmentHistory from '../../components/appointment-history';
import Taro from '@tarojs/taro';
import styles from './index.module.less';
import { cancelAppointment, User, UserInfoWechat } from '@/api';
import { useUserStore } from '@/store/user';
import { useMembershipStore } from '@/store/membership';
import { useAppointmentStore } from '@/store/appointment';
import { useStore } from '@/hooks/useStore';
import { localizeDate } from '@/utils/date';
import MenuItemWrapper from '@/components/menu-item-wrapper';
import { CardTypeName } from '@/types';

const Profile: React.FC = () => {
    const { login, checkLoginStatus, getState, logout } = useUserStore;
    const { fetchMemberships } = useMembershipStore;
    const { fetchAppointments } = useAppointmentStore;
    const userState = useStore(useUserStore);
    const appointmentState = useStore(useAppointmentStore);
    const membershipState = useStore(useMembershipStore);
    const { selectedMembership } = membershipState;

    // 页面显示时检查登录状态
    Taro.useDidShow(() => {
        checkLoginStatus().then(() => {
            if (getState().isLoggedIn) {
                fetchMemberships();
                fetchAppointments();
            }
        });
    });

    const handleLoginSuccess = async (token: string, userInfoWechat?: UserInfoWechat, userInfo?: User) => {
        await login(token, userInfoWechat, userInfo);
        if (userInfo) {
            await fetchMemberships();
            await fetchAppointments();
        }
    };

    const handleAppointmentClick = (appointment: any) => {
        // 可以跳转到预约详情页
        console.log('点击预约:', appointment);
    };

    const handleCancelAppointment = (appointment: any) => {
        Taro.showModal({
            title: '确认取消预约',
            content: '确定要取消本次预约吗？',
            confirmText: '确认取消',
            cancelText: '再想想',
            success: async function (res) {
                if (res.confirm) {
                    try {
                        await cancelAppointment(appointment.id);
                        await fetchAppointments();
                        Taro.showToast({
                            title: '取消成功',
                            icon: 'success'
                        });
                    } catch (error) {
                        Taro.showToast({
                            title: '取消失败',
                            icon: 'none'
                        });
                    }
                } else {
                    // 用户点了取消
                    console.log('用户放弃取消');
                }
            }
        });
    };

    const handleLogout = async () => {
        try {
            await logout();
            
            // 清除预约和会员数据
            useAppointmentStore.setState({
                appointments: [],
                loading: false,
                error: null
            });
            
            useMembershipStore.setState({
                memberships: [],
                selectedMembership: null,
                loading: false,
                error: null
            });
            
            Taro.showToast({
                title: '退出成功',
                icon: 'success'
            });
        } catch (error) {
            Taro.showToast({
                title: '退出失败',
                icon: 'none'
            });
        }
    };

    return (
        <View className={styles.wrapper}>
            <View className={styles.profile_header}>
                <Image src={userState.avatar} className={styles.profile_avatar} />
                <Text className={styles.profile_name}>{userState.name}</Text>
            </View>
            {(
                <View className={styles.profile_content}>
                    {/* 会员卡信息 */}
                    <MenuItemWrapper label='我的会员'>
                        <VipCard
                            cardName={selectedMembership?.type_id ? CardTypeName[selectedMembership.type_id] : '暂无'}
                            remainingDays={selectedMembership?.remaining_sessions || 0}
                            expireDate={selectedMembership?.expired_at ? localizeDate(selectedMembership?.expired_at) : 'xxxx-xx-xx'}
                        />
                    </MenuItemWrapper>
                    {/* 预约历史 */}
                    <MenuItemWrapper label='预约记录'>
                        <AppointmentHistory
                            appointments={appointmentState.appointments}
                            loading={appointmentState.loading}
                            onAppointmentClick={handleAppointmentClick}
                            onCancelAppointment={handleCancelAppointment}
                            className={styles.appointment_history}
                        /></MenuItemWrapper>
                    {/* 退出登录 */}
                    {
                        getState().isLoggedIn && <View className={styles.profile_logout}>
                            <Button className={styles.profile_logout_button} onClick={handleLogout}>退出登录</Button>
                        </View>
                    }
                </View>
            )}
            {
                !getState().isLoggedIn && <View className={styles.profile_footer}>
                    <WeappLoginButton onSuccess={handleLoginSuccess} />
                </View>
            }
        </View>
    );
};

export default Profile; 