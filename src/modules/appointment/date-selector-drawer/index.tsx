import { View } from "@tarojs/components";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { ITouchEvent } from "@tarojs/components/types/common";
import styles from "./index.module.less";
import { generateNextDays } from "@/utils/index";
import { WEEK_DAYS } from "@/constants";
import { Coach, getCoachAvailability, TimeSlot } from "@/api";
import Taro from "@tarojs/taro";
import { localizeDate } from "@/utils/date";

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
}

const DateSelectorDrawer = ({
  selectedCoach,
  visible,
  onClose,
  onConfirm,
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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [currentTranslateY, setCurrentTranslateY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isInScrollView, setIsInScrollView] = useState<boolean>(false);

  const isConfirmButtonDisabled = useMemo<boolean>(() => {
    return !currentSelectedDate || !currentSelectedTimeSlot;
  }, [currentSelectedDate, currentSelectedTimeSlot]);

  // 当选中日期或教练改变时，获取可用时间段
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (!selectedCoach || !currentSelectedDate || !visible) return;

      try {
        setLoading(true);
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
  }, [selectedCoach, currentSelectedDate, visible]);

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
      onClose();
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
    onClose();
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
      <View className={styles.mask} onClick={onClose}></View>
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
            <View className={styles.date_selector} data-dom="date_selector">
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
            data-dom="date_selector"
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
