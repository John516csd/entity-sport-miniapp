import { View, Text } from '@tarojs/components';
import { generateColorTheme, generateGradientCSS, generateCircleColors } from '@/utils/colorGenerator';
import styles from './index.module.less';

const VipCard = ({ cardName, remainingDays, expireDate }: { cardName: string, remainingDays: number, expireDate: string }) => {
    // 根据卡片名称生成颜色主题
    const colorTheme = generateColorTheme(cardName);
    const gradientStyle = generateGradientCSS(colorTheme);
    const circleColors = generateCircleColors(colorTheme);
    return (
        <View 
            className={styles.vip_card}
            style={{
                background: `${gradientStyle}, radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`
            }}
        >
            {/* 头部 */}
            <View className={styles.vip_card_header}>
                <View className={styles.vip_logo_expire_date_wrapper}>
                    <Text 
                        className={styles.logo_letter}
                        style={{ color: colorTheme.accent }}
                    >
                        Entity VIP
                    </Text>
                    <Text className={styles.expire_date}>{expireDate} 过期</Text>
                </View>
            </View>
            {/* 底部 */}
            <View className={styles.vip_card_footer}>
                <Text className={styles.vip_card_remaining_text}>剩余</Text>
                <Text 
                    className={styles.vip_card_remaining_days}
                    style={{ color: colorTheme.accent }}
                >
                    {remainingDays}
                </Text>
            </View>
            {/* 类型 */}
            <View className={styles.vip_card_type}>
                <Text className={styles.vip_card_type_text}>{cardName}</Text>
            </View>
            {/* 背景 */}
            <View className={styles.vip_card_bg}>
                <View 
                    className={styles.circle_1}
                    style={{ background: circleColors.circle1 }}
                ></View>
                <View 
                    className={styles.circle_2}
                    style={{ background: circleColors.circle2 }}
                ></View>
            </View>
        </View>
    );
}

export default VipCard;