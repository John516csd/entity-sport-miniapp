import React, { useEffect, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import DefaultAvatar from '../../assets/profile/default-avatar.png';
import VipCard from '../../components/vip-card';
import WeappLoginButton from '../../components/wx-login-wrapper';
import Taro from '@tarojs/taro';
import styles from './index.module.less';
import { User, UserInfoWechat } from '@/api';

const Profile: React.FC = () => {
    const [avatar, setAvatar] = useState(DefaultAvatar);
    const [name, setName] = useState('xxx');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 检查登录状态
    const checkLoginStatus = async () => {
        try {
            const tokenRes = await Taro.getStorage({ key: 'token' });
            if (tokenRes.errMsg === 'getStorage:ok') {
                setIsLoggedIn(true);
                // 获取用户信息
                const userInfoRes = await Taro.getStorage({ key: 'userInfoWechat' });
                if (userInfoRes.errMsg === 'getStorage:ok') {
                    setAvatar(userInfoRes.data.avatarUrl);
                    setName(userInfoRes.data.nickName);
                }
            } else {
                setIsLoggedIn(false);
                setAvatar(DefaultAvatar);
                setName('xxx');
            }
        } catch (err) {
            console.error('检查登录状态失败:', err);
            setIsLoggedIn(false);
            setAvatar(DefaultAvatar);
            setName('xxx');
        }
    };

    const handleLoginSuccess = (token: string, userInfoWechat?: UserInfoWechat, userInfo?: User) => {
        console.log('登录成功:', userInfoWechat, userInfo);
        setAvatar(userInfoWechat?.avatarUrl || DefaultAvatar);
        setName(userInfoWechat?.nickName || 'xxx');
        setIsLoggedIn(true);
        Taro.setStorage({
            key: 'token',
            data: token
        });
        Taro.setStorage({
            key: 'userInfo',
            data: userInfo
        });
        Taro.setStorage({
            key: 'userInfoWechat',
            data: userInfoWechat
        });
    };

    // 页面显示时检查登录状态
    Taro.useDidShow(() => {
        checkLoginStatus();
    });

    return (
        <View className={styles.wrapper}>
            <View className={styles.profile_header}>
                <Image src={avatar} className={styles.profile_avatar} />
                <Text className={styles.profile_name}>{name}</Text>
            </View>
            {isLoggedIn && (
                <View className={styles.profile_card_info}>
                    <Text className={styles.profile_card_info_title}>我的会员</Text>
                    <VipCard cardType='年卡' remainingDays={100} expireDate='2025-01-01' />
                </View>
            )}
            {
                !isLoggedIn && <View className={styles.profile_footer}>
                    <WeappLoginButton onSuccess={handleLoginSuccess} />
                </View>
            }
        </View>
    );
};

export default Profile; 