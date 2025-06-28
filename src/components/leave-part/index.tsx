import { View, Text } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.less";
import LeaveRequestDrawer from "../leave-request-drawer";
import { createMembershipLeave, getMembershipLeaves } from "@/api/membership";
import { useStore } from "@/hooks/useStore";
import { useMembershipStore } from "@/store/membership";
import { MembershipLeaveResponse } from "@/api/types";
import { useModalManager } from "@/hooks/useModalManager";

interface LeavePartProps {
  onLeaveRequest?: () => void;
  onLeaveRecord?: () => void;
}

const LeavePart = ({ onLeaveRequest, onLeaveRecord }: LeavePartProps) => {
  const [showLeaveDrawer, setShowLeaveDrawer] = useState(false);
  const [leaveRecords, setLeaveRecords] = useState<MembershipLeaveResponse[]>([]);
  const membershipState = useStore(useMembershipStore);

  const handleLeaveRequest = async () => {
    console.log("请假");
    
    // 获取当前选中的会员卡
    const selectedMembership = membershipState.selectedMembership || membershipState.memberships[0];
    
    if (!selectedMembership) {
      Taro.showToast({
        title: "请先获取会员卡信息",
        icon: "error",
      });
      return;
    }

    try {
      // 获取该会员卡的请假记录
      const leaves = await getMembershipLeaves(selectedMembership.id);
      // 过滤掉已取消的请假记录，只保留有效的请假记录
      const activeLeaves = leaves.filter(leave => leave.status !== 'cancelled');
      setLeaveRecords(activeLeaves);
    } catch (error) {
      console.error("获取请假记录失败:", error);
      // 即使获取失败也允许继续，只是不能检测冲突
      setLeaveRecords([]);
    }
    
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
    // 获取当前选中的会员卡
    const selectedMembership = membershipState.selectedMembership || membershipState.memberships[0];
    
    if (!selectedMembership) {
      Taro.showToast({
        title: "请先获取会员卡信息",
        icon: "error",
      });
      throw new Error("请先获取会员卡信息");
    }

    try {
      await createMembershipLeave(selectedMembership.id, {
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
      });

      Taro.showToast({
        title: "请假申请提交成功",
        icon: "success",
      });

      setShowLeaveDrawer(false);
    } catch (error) {
      const errorMessage = error?.message || "请假申请失败";
      
      // 使用 showModal 来显示长消息，因为 showToast 有长度限制
      if (errorMessage.length > 20) {
        Taro.showModal({
          title: "请假申请失败",
          content: errorMessage,
          showCancel: false,
          confirmText: "确定"
        });
      } else {
        Taro.showToast({
          title: errorMessage,
          icon: "error",
        });
      }
      
      // 重新抛出错误，让子组件知道提交失败了
      throw error;
    }
  };

  const handleCloseDrawer = () => {
    setShowLeaveDrawer(false);
  };

  // 使用模态框管理器
  const enhancedCloseDrawer = useModalManager(
    'leave-request-drawer',
    showLeaveDrawer,
    handleCloseDrawer
  );

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
        onClose={enhancedCloseDrawer}
        onSubmit={handleLeaveSubmit}
        membership={membershipState.selectedMembership || membershipState.memberships[0]}
        existingLeaves={leaveRecords}
      />
    </>
  );
};

export default LeavePart;
