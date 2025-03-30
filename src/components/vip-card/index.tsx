import { View, Text, Image } from '@tarojs/components';
import './index.less';

const VipCard = ({ cardType, remainingDays, expireDate }) => {
    return (
        <View className='vip-card'>
            <View className='vip-card-header'>
                <View className='vip-card-logo'>
                    <Text className='logo-letter'>Entity</Text>
                </View>
            </View>

            <View className='vip-card-content'>
                <Text className='vip-card-title'>{cardType}</Text>

                <View className='vip-card-details'>
                    <Text className='vip-card-validity'>有效期{cardType === '健身年卡' ? '1年' : '1个月'}</Text>
                    <Text className='vip-card-remaining'>剩余: {remainingDays} 天</Text>
                    <Text className='vip-card-expire'>到期: {expireDate}</Text>
                </View>
            </View>
        </View>
    );
}

export default VipCard;