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
    const [distance, setDistance] = useState<number | null>(0);

    useEffect(() => {
        // 先检查用户是否授权位置信息
        Taro.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userLocation']) {
                    // 已授权，获取用户位置
                    Taro.getLocation({
                        type: 'gcj02', // 使用国测局坐标系
                        success: function (res) {
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
                        fail: function () {
                            setDistance(0);
                        }
                    });
                } else {
                    // 未授权，设置默认距离
                    setDistance(0);
                }
            },
            fail: function () {
                setDistance(0);
            }
        });
    }, []);

    // 处理导航点击事件
    const handleNavigateToGym = () => {
        // 先检查位置权限，如果没有则请求授权
        Taro.getSetting({
            success: function (res) {
                if (!res.authSetting['scope.userLocation']) {
                    // 没有授权，请求授权
                    Taro.authorize({
                        scope: 'scope.userLocation',
                        success: function () {
                            // 授权成功，打开位置
                            openLocation();
                        },
                        fail: function () {
                            // 授权失败，直接打开位置（不显示距离）
                            openLocation();
                        }
                    });
                } else {
                    // 已有授权，直接打开位置
                    openLocation();
                }
            },
            fail: function () {
                openLocation();
            }
        });
    };

    // 打开位置的通用函数
    const openLocation = () => {
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

    // 处理预约教练点击事件
    const handleBookCoach = () => {
        Taro.switchTab({
            url: '/pages/appointment/index'
        }).catch(error => {
            console.error('跳转失败:', error);
            Taro.showToast({
                title: '跳转失败，请稍后重试',
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
                    !!distance && (
                        <Text className={styles.cta_item_distance}>
                            {`距您 ${distance}km`}
                        </Text>
                    )
                }
            </View>
            <View className={styles.cta_item} onClick={handleBookCoach}>
                <Image src={BookTime} className={styles.cta_item_image} />
                <Text className={styles.cta_item_subtitle}>BOOK A COACH</Text>
                <Text className={styles.cta_item_title}>预约教练</Text>
                {
                    !!distance && <Text className={`${styles.cta_item_distance} ${styles.cta_item_placeholder}`}>距您 3km</Text>
                }
            </View>
        </View>
    )
}

export default CtaContainer;