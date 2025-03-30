// 微信授权登录按钮示例（获取用户基础信息）
import { Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';

function WeappLoginButton(props) {
    const [isLogin, setIsLogin] = useState(false);

    async function onGetPhoneNumber(e) {
        try {
            setIsLogin(true);

            // 检查是否有错误信息
            if (e.detail.errMsg && e.detail.errMsg !== 'getPhoneNumber:ok') {
                throw new Error(e.detail.errMsg);
            }

            // 获取登录code
            const loginResult = await Taro.login();
            if (!loginResult.code) {
                throw new Error('登录失败,未获取到code');
            }

            const { code } = loginResult;
            const { encryptedData, iv } = e.detail;
            // 打印调试信息
            console.log("🚀 ~ onGetUserInfo ~ code:", code);
            console.log("🚀 ~ onGetPhoneNumber ~ detail:", e.detail);
            const res = await Taro.request({
                method: 'POST',
                url: 'http://localhost:3001/api/auth/wechat-bind-login',
                data: { code, encryptedData, iv }
            });
            console.log("🚀 ~ onGetPhoneNumber ~ res:", res)
            // TODO: 这里可以调用后端API进行登录验证

        } catch (error) {
            console.error('登录失败:', error);
            Taro.showToast({
                title: '登录失败',
                icon: 'none'
            });
        } finally {
            setIsLogin(false);
        }
    }

    return (
        <Button
            openType="getPhoneNumber"
            onGetPhoneNumber={onGetPhoneNumber}
            loading={isLogin}
        >
            微信一键登录
        </Button>
    );
}

export default WeappLoginButton;