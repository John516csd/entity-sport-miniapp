import { View, Text } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.less";
import LeaveRequestDrawer from "../leave-request-drawer";
import { createMembershipLeave } from "@/api/membership";
import { useStore } from "@/hooks/useStore";
import { useMembershipStore } from "@/store/membership";

interface LeavePartProps {
  onLeaveRequest?: () => void;
  onLeaveRecord?: () => void;
}

const LeavePart = ({ onLeaveRequest, onLeaveRecord }: LeavePartProps) => {
  const [showLeaveDrawer, setShowLeaveDrawer] = useState(false);
  const membershipState = useStore(useMembershipStore);

  const handleLeaveRequest = () => {
    console.log("请假");
    setShowLeaveDrawer(true);
    onLeaveRequest?.();
  };

  const handleLeaveRecord = () => {
    console.log("请假记录");
    Taro.navigateTo({
      url: "/pages/leave-records/index",
    });
    onLeaveRecord?.();
  };

  const handleLeaveSubmit = async (data: {
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    try {
      // 获取当前选中的会员卡
      const selectedMembership = membershipState.selectedMembership || membershipState.memberships[0];
      
      if (!selectedMembership) {
        Taro.showToast({
          title: "请先获取会员卡信息",
          icon: "error",
        });
        return;
      }

      Taro.showLoading({ title: "提交中..." });

      await createMembershipLeave(selectedMembership.id, {
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
      });

      Taro.hideLoading();
      Taro.showToast({
        title: "请假申请提交成功",
        icon: "success",
      });

      setShowLeaveDrawer(false);
    } catch (error) {
      Taro.hideLoading();
      console.error("请假申请失败:", error);
      Taro.showToast({
        title: "请假申请失败",
        icon: "error",
      });
    }
  };

  const handleCloseDrawer = () => {
    setShowLeaveDrawer(false);
  };

  return (
    <>
      <View className={styles.leave_part}>
        <View className={styles.leave_item} onClick={handleLeaveRequest}>
          <View className={styles.leave_item_left}>
            <View className={styles.leave_icon}>
              <Text className={styles.icon_text}>📝</Text>
            </View>
            <Text className={styles.leave_text}>请假</Text>
          </View>
          <View className={styles.arrow}>
            <Text>➡️</Text>
          </View>
        </View>

        <View className={styles.leave_item} onClick={handleLeaveRecord}>
          <View className={styles.leave_item_left}>
            <View className={styles.leave_icon}>
              <Text className={styles.icon_text}>📋</Text>
            </View>
            <Text className={styles.leave_text}>请假记录</Text>
          </View>
          <View className={styles.arrow}>
            <Text>➡️</Text>
          </View>
        </View>
      </View>

      <LeaveRequestDrawer
        visible={showLeaveDrawer}
        onClose={handleCloseDrawer}
        onSubmit={handleLeaveSubmit}
      />
    </>
  );
};

export default LeavePart;
