import { View, Text, Button } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.less";
import { getMembershipLeaves } from "@/api/membership";
import { MembershipLeaveResponse, LeaveStatus } from "@/api/types";
import { useStore } from "@/hooks/useStore";
import { useMembershipStore } from "@/store/membership";

// 移除本地的LeaveRecord接口，使用API中的MembershipLeaveResponse

const LeaveRecords = () => {
  const [records, setRecords] = useState<MembershipLeaveResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const membershipState = useStore(useMembershipStore);

  useEffect(() => {
    loadLeaveRecords();
  }, [membershipState.selectedMembership]);

  const loadLeaveRecords = async () => {
    try {
      // 获取当前选中的会员卡
      const selectedMembership = membershipState.selectedMembership || membershipState.memberships[0];
      
      if (!selectedMembership) {
        console.log("没有找到会员卡信息");
        return;
      }

      setLoading(true);
      const response = await getMembershipLeaves(selectedMembership.id);
      setRecords(response);
    } catch (error) {
      console.error("获取请假记录失败:", error);
      Taro.showToast({
        title: "获取请假记录失败",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: LeaveStatus) => {
    switch (status) {
      case "pending":
        return "审核中";
      case "approved":
        return "已通过";
      case "rejected":
        return "已拒绝";
      case "cancelled":
        return "已取消";
      default:
        return "未知";
    }
  };

  const getStatusClass = (status: LeaveStatus) => {
    switch (status) {
      case "pending":
        return styles.status_pending;
      case "approved":
        return styles.status_approved;
      case "rejected":
        return styles.status_rejected;
      case "cancelled":
        return styles.status_rejected; // 取消状态使用和拒绝相同的样式
      default:
        return "";
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleRefresh = () => {
    loadLeaveRecords();
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Button className={styles.refresh_btn} onClick={handleRefresh} disabled={loading}>
          {loading ? "刷新中..." : "刷新"}
        </Button>
      </View>
      <View className={styles.content}>
        {loading ? (
          <View className={styles.empty}>
            <Text className={styles.empty_text}>加载中...</Text>
          </View>
        ) : records.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.empty_text}>暂无请假记录</Text>
          </View>
        ) : (
          <View className={styles.records_list}>
            {records.map((record) => (
              <View key={record.id} className={styles.record_item}>
                <View className={styles.record_header}>
                  <View className={styles.date_info}>
                    <Text className={styles.date_text}>
                      {record.start_date} 至 {record.end_date}
                    </Text>
                    <Text className={styles.days_text}>
                      ({calculateDays(record.start_date, record.end_date)}天)
                    </Text>
                  </View>
                  <View
                    className={`${styles.status} ${getStatusClass(
                      record.status
                    )}`}
                  >
                    <Text className={styles.status_text}>
                      {getStatusText(record.status)}
                    </Text>
                  </View>
                </View>

                <View className={styles.reason}>
                  <Text className={styles.reason_label}>请假理由：</Text>
                  <Text className={styles.reason_text}>{record.reason || "无"}</Text>
                </View>

                <View className={styles.submit_time}>
                  <Text className={styles.submit_time_text}>
                    提交时间：{formatDateTime(record.applied_at)}
                  </Text>
                </View>

                {record.review_comment && (
                  <View className={styles.review_comment}>
                    <Text className={styles.review_comment_label}>审核备注：</Text>
                    <Text className={styles.review_comment_text}>{record.review_comment}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default LeaveRecords;
