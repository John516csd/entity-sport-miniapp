import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import styles from './index.module.less'
import Gymnasium from '../../assets/index/gymnasium.png';
import BookTime from '../../assets/index/book-time.png';
import { calculateDistance } from '../../utils/index';

// 健身房位置信息
const GYM_LOCATION = {
    latitude: 22.521516, // 示例坐标，需要替换为实际健身房的坐标
    longitude: 113.923606,
    name: '深圳市安特体健身有限公司', // 位置名称
    address: '深圳市南山区南油第四工业区7栋504(南山地铁站C口步行230米)' // 详细地址
};

const CtaContainer = () => {
    const [distance, setDistance] = useState<number | null>(null);

    useEffect(() => {
        // 获取用户位置
        Taro.getLocation({
            type: 'gcj02', // 使用国测局坐标系
            success: function(res) {
                const userLatitude = res.latitude;
                const userLongitude = res.longitude;
                
                // 计算距离
                const dist = calculateDistance(
                    userLatitude,
                    userLongitude,
                    GYM_LOCATION.latitude,
                    GYM_LOCATION.longitude
                );
                setDistance(dist);
            },
            fail: function() {
                setDistance(null);
            }
        });
    }, []);

    // 处理导航点击事件
    const handleNavigateToGym = () => {
        Taro.openLocation({
            latitude: GYM_LOCATION.latitude,
            longitude: GYM_LOCATION.longitude,
            name: GYM_LOCATION.name,
            address: GYM_LOCATION.address,
            scale: 18
        }).catch(error => {
            console.error('导航失败:', error);
            Taro.showToast({
                title: '导航失败，请稍后重试',
                icon: 'none'
            });
        });
    };

    return (
        <View className={styles.cta_container}>
            <View className={styles.cta_item} onClick={handleNavigateToGym}>
                <Image src={Gymnasium} className={styles.cta_item_image} />
                <Text className={styles.cta_item_subtitle}>GO TO GYM</Text>
                <Text className={styles.cta_item_title}>去健身房</Text>
                {
                    distance && (
                        <Text className={styles.cta_item_distance}>
                            {`距您 ${distance}km`}
                        </Text>
                    )
                }
            </View>
            <View className={styles.cta_item}>
                <Image src={BookTime} className={styles.cta_item_image} />
                <Text className={styles.cta_item_subtitle}>BOOK A COACH</Text>
                <Text className={styles.cta_item_title}>预约教练</Text>
                {
                    distance && <Text className={`${styles.cta_item_distance} ${styles.cta_item_placeholder}`}>距您 3km</Text>
                }
            </View>
        </View>
    )
}

export default CtaContainer;