import { View, Text } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.less";
import LeaveRequestDrawer from "../leave-request-drawer";

interface LeavePartProps {
  onLeaveRequest?: () => void;
  onLeaveRecord?: () => void;
}

const LeavePart = ({ onLeaveRequest, onLeaveRecord }: LeavePartProps) => {
  const [showLeaveDrawer, setShowLeaveDrawer] = useState(false);

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

  const handleLeaveSubmit = (data: {
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    console.log("请假申请提交:", data);
    // 这里可以调用API提交请假申请
    setShowLeaveDrawer(false);
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
