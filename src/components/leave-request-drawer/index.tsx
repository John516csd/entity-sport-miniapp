import { View, Text, Button, Textarea, Picker } from "@tarojs/components";
import { useState } from "react";
import styles from "./index.module.less";
import Taro from "@tarojs/taro";

interface LeaveRequestDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    startDate: string;
    endDate: string;
    reason: string;
  }) => void;
}

const LeaveRequestDrawer = ({
  visible,
  onClose,
  onSubmit,
}: LeaveRequestDrawerProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!startDate || !endDate || !reason.trim()) {
      // 可以添加提示
      Taro.showToast({
        title: "请填写完整信息",
        icon: "none",
      });
      console.log("请填写完整信息");
      return;
    }

    onSubmit({
      startDate,
      endDate,
      reason,
    });

    // 重置表单
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleCancel = () => {
    // 重置表单
    setStartDate("");
    setEndDate("");
    setReason("");
    onClose();
  };

  if (!visible) return null;

  return (
    <View className={styles.overlay} onClick={onClose}>
      <View className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>请假申请</Text>
          <Button className={styles.close_btn} onClick={handleCancel}>
            ✕
          </Button>
        </View>

        <View className={styles.form}>
          <View className={styles.form_item}>
            <Text className={styles.label}>开始时间</Text>
            <Picker
              mode="date"
              value={startDate}
              onChange={(e) => setStartDate(e.detail.value)}
            >
              <View className={styles.picker}>
                <Text
                  className={
                    startDate ? styles.picker_text : styles.placeholder
                  }
                >
                  {startDate || "请选择开始时间"}
                </Text>
              </View>
            </Picker>
          </View>

          <View className={styles.form_item}>
            <Text className={styles.label}>结束时间</Text>
            <Picker
              mode="date"
              value={endDate}
              onChange={(e) => setEndDate(e.detail.value)}
            >
              <View className={styles.picker}>
                <Text
                  className={endDate ? styles.picker_text : styles.placeholder}
                >
                  {endDate || "请选择结束时间"}
                </Text>
              </View>
            </Picker>
          </View>

          <View className={styles.form_item}>
            <Text className={styles.label}>请假理由</Text>
            <Textarea
              className={styles.textarea}
              placeholder="请输入请假理由"
              value={reason}
              onInput={(e) => setReason(e.detail.value)}
              maxlength={200}
            />
          </View>
        </View>

        <View className={styles.actions}>
          <Button className={styles.cancel_btn} onClick={handleCancel}>
            取消
          </Button>
          <Button className={styles.submit_btn} onClick={handleSubmit}>
            提交申请
          </Button>
        </View>
      </View>
    </View>
  );
};

export default LeaveRequestDrawer;
