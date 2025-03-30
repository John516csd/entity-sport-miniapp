import React, { useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { mockMyself } from '../../mock/users';
import './index.less';
const isLoggedIn = true; // 这里应该从全局状态或存储中获取实际的登录状态
import DefaultAvatar from '../../assets/profile/default-avatar.png';
import VipCard from '../../components/vip-card';
import WeappLoginButton from '../../components/wx-login-wrapper';

const Profile: React.FC = () => {
    // useEffect(() => {
    //     if (!isLoggedIn) {
    //         Taro.redirectTo({ url: '/pages/login/index' });
    //     }
    // }, []);

    return (
        <View style={{ padding: '20px' }}>
            <View className='profile-header'>
                <Image src={DefaultAvatar} className='profile-avatar' />
                <Text className='profile-name'>{mockMyself.name}</Text>
            </View>
            <View className='profile-card-info'>
                <Text className='profile-card-info-title'>我的会员</Text>
                <VipCard cardType='健身年卡' remainingDays={100} expireDate='2025-01-01' />
            </View>
            {/* 微信一键登录 */}
            <WeappLoginButton />
        </View>
    );
};

export default Profile; 