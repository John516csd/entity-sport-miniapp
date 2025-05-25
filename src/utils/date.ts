import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

// 设置语言为中文
dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

/**
 * 格式化日期
 * @param date 日期字符串或 Date 对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 * 
 * 支持的格式：
 * - YYYY: 年份，如 2024
 * - MM: 月份，如 01-12
 * - DD: 日期，如 01-31
 * - HH: 小时，如 00-23
 * - mm: 分钟，如 00-59
 * - ss: 秒数，如 00-59
 * 
 * 示例：
 * - localizeDate('2024-03-20') => '2024-03-20'
 * - localizeDate('2024-03-20', 'YYYY年MM月DD日') => '2024年03月20日'
 * - localizeDate('2024-03-20', 'MM月DD日') => '03月20日'
 */
export const localizeDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
    return dayjs(date).format(format);
};

/**
 * 获取相对时间
 * @param date 日期字符串或 Date 对象
 * @returns 相对时间字符串
 * 
 * 示例：
 * - getRelativeTime('2024-03-20') => '3天前'
 * - getRelativeTime('2024-03-19 10:00:00') => '昨天 10:00'
 */
export const getRelativeTime = (date: string | Date): string => {
    return dayjs(date).fromNow();
};

/**
 * 获取日期范围
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param format 格式化模板
 * @returns 格式化后的日期范围字符串
 * 
 * 示例：
 * - getDateRange('2024-03-20', '2024-03-25') => '2024-03-20 至 2024-03-25'
 */
export const getDateRange = (startDate: string | Date, endDate: string | Date, format: string = 'YYYY-MM-DD'): string => {
    return `${dayjs(startDate).format(format)} 至 ${dayjs(endDate).format(format)}`;
};
