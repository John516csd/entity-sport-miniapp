import React, { useEffect, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import DefaultAvatar from '../../assets/profile/default-avatar.png';
import VipCard from '../../components/vip-card';
import WeappLoginButton from '../../components/wx-login-wrapper';
import Taro from '@tarojs/taro';
import styles from './index.module.less';

const Profile: React.FC = () => {
    const [avatar, setAvatar] = useState(DefaultAvatar);
    const [name, setName] = useState('xxx');
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const handleLoginSuccess = (token: string, userInfo) => {
        console.log('登录成功:', userInfo);
        setAvatar(userInfo.avatarUrl);
        setName(userInfo.nickName);
        setIsLoggedIn(true);
        Taro.setStorage({
            key: 'token',
            data: token
        });
        Taro.setStorage({
            key: 'userInfo',
            data: userInfo
        });
    };

    useEffect(() => {
        Taro.getStorage({ key: 'token' }).then((res) => {
            console.log('token:', res);
            if (res.errMsg === 'getStorage:ok') {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        }).catch((err) => {
            setIsLoggedIn(false);
            console.log('getStorage error:', err);
        });
        Taro.getStorage({ key: 'userInfo' }).then((res) => {
            console.log('userInfo:', res);
            if (res.errMsg === 'getStorage:ok') {
                setAvatar(res.data.avatarUrl);
                setName(res.data.nickName);
            }
        }).catch((err) => {
            setIsLoggedIn(false);
            console.log('getStorage error:', err);
        });
    }, []);

    return (
        <View className={styles.wrapper}>
            <View className={styles.profile_header}>
                <Image src={avatar} className={styles.profile_avatar} />
                <Text className={styles.profile_name}>{name}</Text>
            </View>
            <View className={styles.profile_card_info}>
                <Text className={styles.profile_card_info_title}>我的会员</Text>
                <VipCard cardType='年卡' remainingDays={100} expireDate='2025-01-01' />
            </View>
            {
                !isLoggedIn && <View className={styles.profile_footer}>
                    <WeappLoginButton onSuccess={handleLoginSuccess} />
                </View>
            }
        </View>
    );
};

export default Profile; 