import React from 'react';
import { View, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.less';
import WeappLoginButton from '../../components/wx-login-wrapper';
const Login: React.FC = () => {
    const handleLogin = () => {
        Taro.login({
            success: (res) => {
                // if (res.code) {
                //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
                //     console.log('登录成功，code:', res.code);
                //     // 在这里处理登录逻辑，比如调用后端接口
                //     Taro.request({
                //         url: 'https://your-backend-api.com/login', // 替换为你的后端接口
                //         method: 'POST',
                //         data: {
                //             code: res.code
                //         },
                //         success: (response) => {
                //             console.log('后端返回数据:', response.data);
                //             // 处理后端返回的数据，比如保存用户信息或跳转页面
                //         },
                //         fail: (error) => {
                //             console.error('请求失败:', error);
                //         }
                //     });
                // } else {
                //     console.error('登录失败！' + res.errMsg);
                // }
            }
        });
    };

    return (
        <View className="login-page">
            <WeappLoginButton />
        </View>
    );
};

export default Login; 