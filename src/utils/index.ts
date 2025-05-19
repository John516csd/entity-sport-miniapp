// 计算两点之间的距离（单位：千米）
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // 地球半径（千米）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * 生成接下来n天的日期
 * 格式：YYYY-MM-DD
 */
export const generateNextDays = (n: number): string[] => {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < n; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        dates.push(`${year}-${month}-${day}`);
    }

    return dates;
};

export interface TimeSlot {
    timeDurationString: string;
    startTime: string;
}

/**
 * 生成时间段
 * @param startHour 开始小时（24小时制）
 * @param endHour 结束小时（24小时制）
 * @param interval 时间间隔（分钟）
 * @param duration 持续时间（分钟）
 * @returns 时间段数组
 */
export const generateTimeSlots = (
    startHour: number,
    endHour: number,
    interval: number,
    duration: number
): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    for (let currentMinutes = startMinutes; currentMinutes + duration <= endMinutes; currentMinutes += interval) {
        const startTimeMinutes = currentMinutes;
        const endTimeMinutes = currentMinutes + duration;

        const startHour = Math.floor(startTimeMinutes / 60);
        const startMinute = startTimeMinutes % 60;
        const endHour = Math.floor(endTimeMinutes / 60);
        const endMinute = endTimeMinutes % 60;

        const startTimeString = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        const endTimeString = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

        slots.push({
            timeDurationString: `${startTimeString}-${endTimeString}`,
            startTime: startTimeString
        });
    }

    return slots;
};
