import { View, Text } from '@tarojs/components';
import styles from './index.module.less';

const VipCard = ({ cardName, remainingDays, expireDate }: { cardName: string, remainingDays: number, expireDate: string }) => {
    return (
        <View className={styles.vip_card}>
            {/* 头部 */}
            <View className={styles.vip_card_header}>
                <View className={styles.vip_logo_expire_date_wrapper}>
                    <Text className={styles.logo_letter}>Entity VIP</Text>
                    <Text className={styles.expire_date}>{expireDate} 过期</Text>
                </View>
            </View>
            {/* 底部 */}
            <View className={styles.vip_card_footer}>
                <Text className={styles.vip_card_remaining_text}>剩余</Text>
                <Text className={styles.vip_card_remaining_days}>{remainingDays}</Text>
            </View>
            {/* 类型 */}
            <View className={styles.vip_card_type}>
                <Text className={styles.vip_card_type_text}>{cardName}</Text>
            </View>
            {/* 背景 */}
            <View className={styles.vip_card_bg}>
                <View className={styles.circle_1}></View>
                <View className={styles.circle_2}></View>
            </View>
        </View>
    );
}

export default VipCard;