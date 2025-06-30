import { View, Text, Button, Textarea, Picker } from "@tarojs/components";
import { useState } from "react";
import styles from "./index.module.less";
import Taro from "@tarojs/taro";
import { MembershipResponse, MembershipLeaveResponse } from "@/api/types";

interface LeaveRequestDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    startDate: string;
    endDate: string;
    reason: string;
  }) => Promise<void>;
  membership?: MembershipResponse | null;
  existingLeaves?: MembershipLeaveResponse[];
}

const LeaveRequestDrawer = ({
  visible,
  onClose,
  onSubmit,
  membership,
  existingLeaves = [],
}: LeaveRequestDrawerProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 计算可选择的日期范围
  const getDateRange = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD格式
    
    if (!membership?.expired_at) {
      return { minDate: todayStr, maxDate: '' };
    }
    
    const expiredDate = new Date(membership.expired_at);
    const maxDateStr = expiredDate.toISOString().split('T')[0];
    
    return { minDate: todayStr, maxDate: maxDateStr };
  };

  const { minDate, maxDate } = getDateRange();

  // 检查日期是否与现有请假记录冲突
  const checkDateConflict = (newStartDate: string, newEndDate: string) => {
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);

    for (const leave of existingLeaves) {
      // 只检查已批准或待审批的请假记录
      if (leave.status === 'approved' || leave.status === 'pending') {
        const existingStart = new Date(leave.start_date);
        const existingEnd = new Date(leave.end_date);

        // 检查日期范围是否重叠
        if (
          (newStart >= existingStart && newStart <= existingEnd) ||
          (newEnd >= existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        ) {
          return {
            hasConflict: true,
            conflictLeave: leave
          };
        }
      }
    }

    return { hasConflict: false };
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!startDate || !endDate || !reason.trim()) {
      Taro.showToast({
        title: "请填写完整信息",
        icon: "none",
      });
      return;
    }

    // 验证日期是否在会员卡有效期内
    if (membership?.expired_at) {
      const expiredDate = new Date(membership.expired_at);
      const selectedEndDate = new Date(endDate);
      
      if (selectedEndDate > expiredDate) {
        Taro.showToast({
          title: "请假结束时间不能超过会员卡有效期",
          icon: "none",
        });
        return;
      }
    }

    // 验证开始时间不能晚于结束时间
    if (new Date(startDate) > new Date(endDate)) {
      Taro.showToast({
        title: "开始时间不能晚于结束时间",
        icon: "none",
      });
      return;
    }

    // 检查日期冲突
    const conflictResult = checkDateConflict(startDate, endDate);
    if (conflictResult.hasConflict) {
      const leave = conflictResult.conflictLeave!;
      const statusText = leave.status === 'approved' ? '已批准' : '待审批';
      Taro.showModal({
        title: "日期冲突",
        content: `所选时间与您的${statusText}请假记录冲突\n冲突时间：${leave.start_date} 至 ${leave.end_date}`,
        showCancel: false,
        confirmText: "确定"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        startDate,
        endDate,
        reason,
      });

      // 只有成功时才重置表单
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (error) {
      // 错误处理由父组件完成，这里只需要重置loading状态
    } finally {
      setIsSubmitting(false);
    }
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
              mode='date'
              value={startDate}
              start={minDate}
              end={maxDate}
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
              mode='date'
              value={endDate}
              start={startDate || minDate}
              end={maxDate}
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
              placeholder='请输入请假理由'
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
          <Button 
            className={styles.submit_btn} 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "提交中..." : "提交申请"}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default LeaveRequestDrawer;
