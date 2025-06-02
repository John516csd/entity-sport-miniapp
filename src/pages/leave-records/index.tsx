import { View, Text, Button } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.less";

interface LeaveRecord {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submitTime: string;
}

const LeaveRecords = () => {
  const [records, setRecords] = useState<LeaveRecord[]>([]);

  useEffect(() => {
    // 模拟获取请假记录数据
    const mockData: LeaveRecord[] = [
      {
        id: "1",
        startDate: "2024-01-15",
        endDate: "2024-01-17",
        reason: "感冒发烧需要休息",
        status: "approved",
        submitTime: "2024-01-10 14:30",
      },
      {
        id: "2",
        startDate: "2024-01-20",
        endDate: "2024-01-21",
        reason: "家中有事需要处理",
        status: "pending",
        submitTime: "2024-01-18 09:15",
      },
      {
        id: "3",
        startDate: "2024-01-08",
        endDate: "2024-01-09",
        reason: "个人事务",
        status: "rejected",
        submitTime: "2024-01-05 16:20",
      },
    ];
    setRecords(mockData);
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "审核中";
      case "approved":
        return "已通过";
      case "rejected":
        return "已拒绝";
      default:
        return "未知";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return styles.status_pending;
      case "approved":
        return styles.status_approved;
      case "rejected":
        return styles.status_rejected;
      default:
        return "";
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        {records.length === 0 ? (
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
                      {record.startDate} 至 {record.endDate}
                    </Text>
                    <Text className={styles.days_text}>
                      ({calculateDays(record.startDate, record.endDate)}天)
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
                  <Text className={styles.reason_text}>{record.reason}</Text>
                </View>

                <View className={styles.submit_time}>
                  <Text className={styles.submit_time_text}>
                    提交时间：{record.submitTime}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default LeaveRecords;
