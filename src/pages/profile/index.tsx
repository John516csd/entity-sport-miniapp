import React from "react";
import { View, Text, Image, Button } from "@tarojs/components";
import VipCard from "../../components/vip-card";
import MembershipCardsDisplay from "../../components/membership-cards-display";
import CollapsibleSection from "../../components/collapsible-section";
import WeappLoginButton from "../../components/wx-login-wrapper";
import AppointmentHistory from "../../components/appointment-history";
import ContractPart from "../../components/contract-part";
import Taro from "@tarojs/taro";
import styles from "./index.module.less";
import { cancelAppointment, User, UserInfoWechat } from "@/api";
import { useUserStore } from "@/store/user";
import { useMembershipStore } from "@/store/membership";
import { useAppointmentStore } from "@/store/appointment";
import { useContractStore } from "@/store/contract";
import { useStore } from "@/hooks/useStore";
import { localizeDate } from "@/utils/date";
import MenuItemWrapper from "@/components/menu-item-wrapper";
import { CardTypeName } from "@/types";
import DefaultAvatar from "@/assets/profile/default-avatar.png";
import ProfileCard from "@/components/profile-card";
import LeavePart from "@/components/leave-part";
import { useGlobalModalManager } from "@/hooks/useTabSwitchReset";

const Profile: React.FC = () => {
  const { login, checkLoginStatus, getState, logout } = useUserStore;
  const { fetchMemberships } = useMembershipStore;
  const { fetchAppointments } = useAppointmentStore;
  const userState = useStore(useUserStore);
  const appointmentState = useStore(useAppointmentStore);
  const membershipState = useStore(useMembershipStore);
  const selectedMembership = membershipState.selectedMembership;

  // 使用全局模态框管理（只关闭弹窗）
  const { closeAllModals } = useGlobalModalManager();
  
  // 页面隐藏时关闭所有模态框
  Taro.useDidHide(() => {
    closeAllModals();
  });

  // 页面显示时检查登录状态
  Taro.useDidShow(() => {
    checkLoginStatus().then(() => {
      if (getState().isLoggedIn) {
        fetchMemberships();
        fetchAppointments();
      }
    });
  });

  const handleLoginSuccess = async (token: string, userInfo?: User) => {
    try {
      await login(token, userInfo);
      if (userInfo) {
        await fetchMemberships();
        await fetchAppointments();
      }
    } catch (error) {
      console.error("Profile: handleLoginSuccess failed:", error);
    }
  };

  const handleAppointmentClick = (appointment: any) => {
    // 可以跳转到预约详情页
  };

  const handleCancelAppointment = (appointment: any) => {
    Taro.showModal({
      title: "确认取消预约",
      content: "确定要取消本次预约吗？",
      confirmText: "确认取消",
      cancelText: "再想想",
      success: async function (res) {
        if (res.confirm) {
          try {
            await cancelAppointment(appointment.id);
            await fetchAppointments();
            Taro.showToast({
              title: "取消成功",
              icon: "success",
            });
          } catch (error) {
            Taro.showToast({
              title: "取消失败",
              icon: "none",
            });
          }
        } else {
          // 用户点了取消
        }
      },
    });
  };

  const handleLogout = async () => {
    try {
      await logout();

      // 清除预约和会员数据
      useAppointmentStore.setState({
        appointments: [],
        loading: false,
        error: null,
      });

      useMembershipStore.setState({
        memberships: [],
        selectedMembership: null,
        loading: false,
        error: null,
      });

      // 清除合同数据
      useContractStore.setState({
        contracts: [],
        currentContract: null,
        loading: false,
        error: null,
      });

      Taro.showToast({
        title: "退出成功",
        icon: "success",
      });
    } catch (error) {
      Taro.showToast({
        title: "退出失败",
        icon: "none",
      });
    }
  };

  return (
    <View className={styles.wrapper}>
      <View className={styles.profile_card_wrapper}>
        <ProfileCard
          name={userState.user?.name || "xxx"}
          avatarUrl={userState.user?.avatar_url || DefaultAvatar}
          onEditClick={() =>
            Taro.navigateTo({ url: "/pages/profile-edit/index" })
          }
        />
      </View>
      {/* <View className={styles.profile_header}>
        <Image
          src={userState.user?.avatar_url || DefaultAvatar}
          className={styles.profile_avatar}
        />
        <Text className={styles.profile_name}>
          {userState.user?.name || "xxx"}
        </Text>
      </View> */}
      {
        <View className={styles.profile_content}>
          {/* 会员卡信息 */}
          <MenuItemWrapper label='我的会员'>
            <MembershipCardsDisplay
              memberships={membershipState.memberships}
              selectedMembership={selectedMembership}
            />
          </MenuItemWrapper>
          {/* 我的合同 */}
          <ContractPart />
          {/* 预约历史 - 收缩到按钮里 */}
          <CollapsibleSection title='预约'>
            <AppointmentHistory
              appointments={appointmentState.appointments}
              loading={appointmentState.loading}
              onAppointmentClick={handleAppointmentClick}
              onCancelAppointment={handleCancelAppointment}
            />
          </CollapsibleSection>
          {/* 请假 */}
          <LeavePart
            onLeaveRequest={() => {}}
            onLeaveRecord={() => {}}
          />
          {/* 退出登录 */}
          {getState().isLoggedIn && (
            <View className={styles.profile_logout}>
              <Button
                className={styles.profile_logout_button}
                onClick={handleLogout}
              >
                退出登录
              </Button>
            </View>
          )}
        </View>
      }
      {!getState().isLoggedIn && (
        <View className={styles.profile_footer}>
          <WeappLoginButton onSuccess={handleLoginSuccess} />
        </View>
      )}
    </View>
  );
};

export default Profile;
