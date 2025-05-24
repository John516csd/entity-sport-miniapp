import { ScrollView, View } from '@tarojs/components';
import React, { useMemo, useRef, useState } from 'react';
import { ITouchEvent } from '@tarojs/components/types/common';
import styles from './index.module.less';
import { generateNextDays, generateTimeSlots, TimeSlot } from '@/utils/index';
import { WEEK_DAYS } from '@/constants';
import { Coach } from '@/api';

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

const DateSelectorDrawer = ({ selectedCoach, visible, onClose, onConfirm }: DateSelectorDrawerProps) => {
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
    const timeSlots = useMemo<TimeSlot[]>(() => {
        return generateTimeSlots(9, 22, 30, 60);
    }, []);
    console.log("🚀 ~ DateSelectorDrawer ~ timeSlots:", timeSlots)

    const [currentSelectedDate, setCurrentSelectedDate] = useState<DateItem>(next14Days[0]);
    const [currentSelectedTimeSlot, setCurrentSelectedTimeSlot] = useState<TimeSlot>();

    const wrapperRef = useRef<HTMLDivElement>(null);
    const [touchStartY, setTouchStartY] = useState<number>(0);
    const [currentTranslateY, setCurrentTranslateY] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isInScrollView, setIsInScrollView] = useState<boolean>(false);

    const isConfirmButtonDisabled = useMemo<boolean>(() => {
        return !currentSelectedDate || !currentSelectedTimeSlot;
    }, [currentSelectedDate, currentSelectedTimeSlot]);

    const handleTouchStart = (e: ITouchEvent) => {
        const target = e.target as HTMLDivElement;
        if (target.dataset.dom?.startsWith('scroll_view')) {
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
        console.log("🚀 ~ handleDateItemClick ~ date:", date)
        setCurrentSelectedDate(date);
    };

    const handleTimeSlotClick = (timeSlot: TimeSlot) => {
        console.log("🚀 ~ handleTimeSlotClick ~ timeSlot:", timeSlot)
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
            className={`${styles.wrapper} ${visible ? styles.visible : styles.hidden}`}
            ref={wrapperRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                transform: `translateY(${currentTranslateY}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
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
                                {
                                    next14Days.map((date) => (
                                        <View key={date.day} className={`${styles.date_item} ${currentSelectedDate.date === date.date ? styles.selected : ''}`} onClick={() => handleDateItemClick(date)}>
                                            <View className={styles.date_item_title}>{date.day}</View>
                                            <View className={styles.date_item_week_day}>{date.weekDay}</View>
                                        </View>
                                    ))
                                }
                            </View>
                        </View>
                    </View>
                    {/* 时间选择 */}
                    <View className={styles.time_selector_wrapper} data-dom="date_selector">
                        <View className={styles.time_selector_list}>
                            {
                                timeSlots.map((timeSlot) => (
                                    <View key={timeSlot.startTime}
                                        className={`${styles.time_selector_item} ${currentSelectedTimeSlot?.startTime === timeSlot.startTime ? styles.selected : ''}`}
                                        onClick={() => handleTimeSlotClick(timeSlot)}>
                                        <View className={styles.time_selector_item_time}>{timeSlot.timeDurationString}</View>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                    {/* 确认按钮 */}
                    <View className={styles.confirm_button_wrapper}>
                        <View className={`${styles.confirm_button} ${isConfirmButtonDisabled ? styles.disabled : ''}`} onClick={handleConfirmButtonClick}>
                            <View className={styles.confirm_button_text}>确认</View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default DateSelectorDrawer;