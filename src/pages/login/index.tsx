import React, { useEffect } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.less';
import WeappLoginButton from '../../components/wx-login-wrapper';

const Login: React.FC = () => {
    // 检查是否已经登录
    useEffect(() => {
        const token = Taro.getStorageSync('token');
        if (token) {
            // 如果已经有token，检查是否有重定向页面
            const redirectUrl = Taro.getStorageSync('redirect_after_login');
            if (redirectUrl) {
                Taro.removeStorageSync('redirect_after_login');
                Taro.navigateBack();
            } else {
                Taro.reLaunch({
                    url: '/pages/index/index'
                });
            }
        }
    }, []);


    return (
        <View className='login-page'>
            <WeappLoginButton />
        </View>
    );
};

export default Login; 