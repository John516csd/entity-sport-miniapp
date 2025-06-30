import { View } from "@tarojs/components";
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { ITouchEvent } from "@tarojs/components/types/common";
import styles from "./index.module.less";
import { generateNextDays } from "@/utils/index";
import { WEEK_DAYS } from "@/constants";
import { Coach, getCoachAvailability, TimeSlot, getMembershipLeaves } from "@/api";
import Taro from "@tarojs/taro";
import { localizeDate } from "@/utils/date";
import { useMembershipStore } from "@/store/membership";
import { MembershipLeaveResponse } from "@/api/types";
import { useModalManager } from "@/hooks/useModalManager";

export interface DateItem {
  year: number;
  month: number;
  day: number;
  weekDay: string;
  date: string;
}

interface DateSelectorDrawerProps {
  selectedCoach: Coach | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: DateItem, timeSlot: TimeSlot) => void;
  resetTrigger?: number; // 用于触发重置的信号
}

const DateSelectorDrawer = ({
  selectedCoach,
  visible,
  onClose,
  onConfirm,
  resetTrigger,
}: DateSelectorDrawerProps) => {
  /**
   * 获取14天后的日期
   */
  const next14Days = useMemo<DateItem[]>(() => {
    return generateNextDays(14).map((date) => {
      const dateObj = new Date(date);
      return {
        year: dateObj.getFullYear(),
        month: dateObj.getMonth() + 1,
        day: dateObj.getDate(),
        weekDay: WEEK_DAYS[dateObj.getDay()],
        date,
      };
    });
  }, []);

  const [currentSelectedDate, setCurrentSelectedDate] = useState<DateItem>(
    next14Days[0]
  );
  const [currentSelectedTimeSlot, setCurrentSelectedTimeSlot] =
    useState<TimeSlot>();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  
  const membershipState = useMembershipStore.getState();

  // 使用模态框管理器
  const enhancedOnClose = useModalManager(
    'date-selector-drawer',
    visible,
    onClose
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [currentTranslateY, setCurrentTranslateY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isInScrollView, setIsInScrollView] = useState<boolean>(false);

  const isConfirmButtonDisabled = useMemo<boolean>(() => {
    return !currentSelectedDate || !currentSelectedTimeSlot;
  }, [currentSelectedDate, currentSelectedTimeSlot]);

  // 重置内部状态到初始状态
  const resetInternalState = useCallback(() => {
    setCurrentSelectedDate(next14Days[0]);
    setCurrentSelectedTimeSlot(undefined);
    setAvailableTimeSlots([]);
    setCurrentTranslateY(0);
    setIsDragging(false);
    setIsInScrollView(false);
  }, [next14Days]);

  // 响应重置触发器
  useEffect(() => {
    if (resetTrigger !== undefined) {
      resetInternalState();
    }
  }, [resetTrigger, resetInternalState]);

  // 检查指定日期是否在请假期间
  const checkIsOnLeave = useCallback(async (targetDate: string): Promise<{ isOnLeave: boolean; leaveRecord?: MembershipLeaveResponse }> => {
    const selectedMembership = membershipState.selectedMembership || membershipState.memberships[0];
    
    if (!selectedMembership) {
      return { isOnLeave: false };
    }

    try {
      const leaves = await getMembershipLeaves(selectedMembership.id);
      const activeLeaves = leaves.filter(leave => 
        leave.status === 'approved' || leave.status === 'pending'
      );

      const targetDateObj = new Date(targetDate);
      
      for (const leave of activeLeaves) {
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        
        if (targetDateObj >= startDate && targetDateObj <= endDate) {
          return { isOnLeave: true, leaveRecord: leave };
        }
      }
      
      return { isOnLeave: false };
    } catch (error) {
      console.error('检查请假状态失败:', error);
      return { isOnLeave: false };
    }
  }, [membershipState.selectedMembership, membershipState.memberships]);

  // 当选中日期或教练改变时，获取可用时间段
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (!selectedCoach || !currentSelectedDate || !visible) return;

      try {
        setLoading(true);
        
        // 首先检查选中日期是否在请假期间
        const leaveCheckResult = await checkIsOnLeave(currentSelectedDate.date);
        
        if (leaveCheckResult.isOnLeave) {
          const leaveRecord = leaveCheckResult.leaveRecord!;
          const statusText = leaveRecord.status === 'approved' ? '已批准' : '待审批';
          
          Taro.showModal({
            title: "无法预约",
            content: `您在选择的日期处于请假期间，无法进行预约\n\n请假状态：${statusText}\n请假时间：${leaveRecord.start_date} 至 ${leaveRecord.end_date}\n${leaveRecord.reason ? `请假理由：${leaveRecord.reason}` : ''}`,
            showCancel: false,
            confirmText: "确定"
          });
          
          setAvailableTimeSlots([]);
          setCurrentSelectedTimeSlot(undefined);
          return;
        }

        const date = new Date(currentSelectedDate.date);
        const timeSlots = await getCoachAvailability(
          selectedCoach.id,
          date.toISOString().split("T")[0]
        );
        setAvailableTimeSlots(timeSlots);
        // 如果当前选中的时间段不在可用时间段中，清除选择
        if (
          currentSelectedTimeSlot &&
          !timeSlots.some(
            (slot) => slot.start === currentSelectedTimeSlot.start
          )
        ) {
          setCurrentSelectedTimeSlot(undefined);
        }
      } catch (error) {
        console.log("🚀 ~ fetchAvailableTimeSlots ~ error:", error);
        Taro.showToast({
          title: "获取可用时间段失败",
          icon: "none",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTimeSlots();
  }, [selectedCoach, currentSelectedDate, visible, checkIsOnLeave]);

  const handleTouchStart = (e: ITouchEvent) => {
    const target = e.target as HTMLDivElement;
    if (target.dataset.dom?.startsWith("scroll_view")) {
      setIsInScrollView(true);
    }

    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: ITouchEvent) => {
    if (!isDragging || isInScrollView) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;

    // 只允许向下滑动
    if (diff > 0) {
      setCurrentTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // 如果滑动距离超过100px，则关闭抽屉
    if (currentTranslateY > 100) {
      enhancedOnClose();
    }

    // 重置状态
    setCurrentTranslateY(0);
    setIsInScrollView(false);
  };

  const handleDateItemClick = (date: DateItem) => {
    setCurrentSelectedDate(date);
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    console.log("🚀 ~ handleTimeSlotClick ~ timeSlot:", timeSlot);
    setCurrentSelectedTimeSlot(timeSlot);
  };

  const handleConfirmButtonClick = () => {
    if (isConfirmButtonDisabled) return;
    if (!currentSelectedTimeSlot) return;
    onConfirm(currentSelectedDate, currentSelectedTimeSlot);
    enhancedOnClose();
  };

  return (
    <View
      className={`${styles.wrapper} ${
        visible ? styles.visible : styles.hidden
      }`}
      ref={wrapperRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${currentTranslateY}px)`,
        transition: isDragging ? "none" : "transform 0.3s ease-in-out",
      }}
    >
      <View className={styles.mask} onClick={enhancedOnClose}></View>
      <View className={styles.content_wrapper}>
        <View className={styles.drawer_deco}>
          <View className={styles.drawer_deco_line}></View>
        </View>
        <View className={styles.main_content}>
          {/* 日期选择 */}
          <View className={styles.date_selector_wrapper}>
            <View className={styles.date_selector_header}>
              {currentSelectedDate.year}年{currentSelectedDate.month}月
            </View>
            <View className={styles.date_selector} data-dom='date_selector'>
              <View className={styles.date_selector_list}>
                {next14Days.map((date) => (
                  <View
                    key={date.day}
                    className={`${styles.date_item} ${
                      currentSelectedDate.date === date.date
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => handleDateItemClick(date)}
                  >
                    <View className={styles.date_item_title}>{date.day}</View>
                    <View className={styles.date_item_week_day}>
                      {date.weekDay}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
          {/* 时间选择 */}
          <View
            className={styles.time_selector_wrapper}
            data-dom='date_selector'
          >
            {loading ? (
              <View className={styles.loading}>加载中...</View>
            ) : availableTimeSlots.length === 0 ? (
              <View className={styles.empty}>暂无可用时间段</View>
            ) : (
              <View className={styles.time_selector_list}>
                {availableTimeSlots.map((timeSlot) => {
                  const startTime = localizeDate(timeSlot.start, "HH:mm");
                  const endTime = localizeDate(timeSlot.end, "HH:mm");
                  return (
                    <View
                      key={timeSlot.start}
                      className={`${styles.time_selector_item} ${
                        currentSelectedTimeSlot?.start === timeSlot.start
                          ? styles.selected
                          : ""
                      }`}
                      onClick={() => handleTimeSlotClick(timeSlot)}
                    >
                      <View
                        className={styles.time_selector_item_time}
                      >{`${startTime}-${endTime}`}</View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          {/* 确认按钮 */}
          <View className={styles.confirm_button_wrapper}>
            <View
              className={`${styles.confirm_button} ${
                isConfirmButtonDisabled ? styles.disabled : ""
              }`}
              onClick={handleConfirmButtonClick}
            >
              <View className={styles.confirm_button_text}>确认</View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DateSelectorDrawer;
