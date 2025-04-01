import { View, Text } from '@tarojs/components';
import './index.less';

const VipCard = ({ cardType, remainingDays, expireDate }) => {
    return (
        <View className='vip-card'>
            {/* 头部 */}
            <View className='vip-card-header'>
                <View className='vip-logo-expire-date-wrapper'>
                    <Text className='logo-letter'>VIP CARD</Text>
                    <Text className='expire-date'>{expireDate} 过期</Text>
                </View>
            </View>
            {/* 底部 */}
            <View className='vip-card-footer'>
                <Text className='vip-card-remaining-text'>剩余</Text>
                <Text className='vip-card-remaining-days'>{remainingDays}</Text>
            </View>
            {/* 类型 */}
            <View className='vip-card-type'>
                <Text className='vip-card-type-text'>{cardType}</Text>
            </View>
            {/* 背景 */}
            <View className='vip-card-bg'>
                <View className='circle-1'></View>
                <View className='circle-2'></View>
            </View>
        </View>
    );
}

export default VipCard;