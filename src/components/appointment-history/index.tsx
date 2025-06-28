import React, { useState } from "react";
import { View, Text, Image, Button } from "@tarojs/components";
import { AppointmentResponse } from "@/api";
import styles from "./index.module.less";
import { BASE_API_URL } from "@/constants";
import { localizeDate } from "@/utils/date";

interface AppointmentHistoryProps {
  appointments: AppointmentResponse[];
  loading?: boolean;
  onAppointmentClick?: (appointment: AppointmentResponse) => void;
  onCancelAppointment?: (appointment: AppointmentResponse) => void;
  className?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentResponse;
  onClick?: () => void;
  onCancelAppointment?: (appointment: AppointmentResponse) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
  onCancelAppointment,
}) => {
  const [showCancel, setShowCancel] = useState(false);
  const canShowCancel = appointment.status === "scheduled";

  const handleCardClick = () => {
    setShowCancel(!showCancel);
    onClick?.();
  };

  const handleCancelClick = () => {
    onCancelAppointment?.(appointment);
  };

  return (
    <View
      key={appointment.id}
      className={styles.frostedCard}
      onClick={handleCardClick}
    >
      <View className={styles.frostedContainer}>
        <View className={styles.frostedLeft}>
          <Image
            className={styles.coach_avatar}
            src={`${BASE_API_URL}${appointment.coach.avatar_url}`}
            mode="aspectFill"
          />
          <Text className={styles.frostedMain}>{appointment.coach.name}</Text>
        </View>
        <View className={styles.frostedDivider} />
        <View className={styles.frostedRight}>
          <Text className={styles.frostedLabel}>
            {appointment.status === "completed"
              ? "已完成"
              : appointment.status === "cancelled"
              ? "已取消"
              : appointment.status === "scheduled"
              ? "已预约"
              : "未开始"}
          </Text>
          <View className={styles.frostedDate}>
            <Text>
              {localizeDate(
                new Date(appointment.appointment_start),
                "YYYY.MM.DD"
              )}
            </Text>
            <Text>
              {localizeDate(new Date(appointment.appointment_start), "HH:mm")} -{" "}
              {localizeDate(new Date(appointment.appointment_end), "HH:mm")}
            </Text>
          </View>
        </View>
      </View>
      {/* 取消按钮 */}
      {canShowCancel && (
        <View
          className={`${styles.frostedCancel} ${
            showCancel ? styles.show : styles.hide
          }`}
          onClick={handleCancelClick}
        >
          <Text>取消</Text>
        </View>
      )}
    </View>
  );
};

const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({
  appointments,
  loading = false,
  onAppointmentClick,
  onCancelAppointment,
  className,
}) => {
  if (loading) {
    return <View className={styles.loading}>加载中...</View>;
  }

  if (appointments.length === 0) {
    return <View className={styles.empty}>暂无预约记录</View>;
  }

  const handleClickCard = (appointment: AppointmentResponse) => {
    onAppointmentClick?.(appointment);
  };

  const handleCancelAppointment = (appointment: AppointmentResponse) => {
    onCancelAppointment?.(appointment);
  };

  return (
    <View className={`${styles.container} ${className}`}>
      <View className={styles.list}>
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onClick={() => handleClickCard(appointment)}
            onCancelAppointment={handleCancelAppointment}
          />
        ))}
      </View>
    </View>
  );
};

export default AppointmentHistory;
