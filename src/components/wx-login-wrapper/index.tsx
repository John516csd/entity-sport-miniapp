// 微信授权登录按钮示例（获取用户基础信息）
import { Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import './index.less';

interface WeappLoginButtonProps {
    className?: string;
    onSuccess?: (token: string, userInfo) => void;
}

function WeappLoginButton(props: WeappLoginButtonProps) {
    const { onSuccess } = props;
    const [isLogin, setIsLogin] = useState(false);

    // 处理获取用户信息
    const handleGetUserInfo = async () => {
        try {
            const modalRes = await Taro.showModal({
                title: '授权提示',
                content: '需要获取您的头像、昵称等信息',
                confirmText: '确认授权',
                cancelText: '暂不授权'
            });

            if (modalRes.confirm) {
                const profileRes = await Taro.getUserProfile({
                    desc: '用于完善会员资料'
                });

                const { userInfo } = profileRes;
                return userInfo;
            } else {
                Taro.showToast({
                    title: '您已取消授权',
                    icon: 'none'
                });
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            Taro.showToast({
                title: '获取用户信息失败',
                icon: 'none'
            });
        }
    };

    async function handleGetPhoneNumber(e?) {
        try {
            setIsLogin(true);

            // 如果是通过按钮直接触发的，检查错误信息
            if (e && e.detail.errMsg && e.detail.errMsg !== 'getPhoneNumber:ok') {
                throw new Error(e.detail.errMsg);
            }

            const userInfo = await handleGetUserInfo();

            // 获取登录code
            const loginResult = await Taro.login();
            if (!loginResult.code) {
                throw new Error('登录失败,未获取到code');
            }

            const { code } = loginResult;
            const encryptedData = e?.detail?.encryptedData;
            const iv = e?.detail?.iv;

            // 打印调试信息
            console.log("🚀 ~ onGetUserInfo ~ code:", code);
            console.log("🚀 ~ onGetPhoneNumber ~ detail:", e?.detail);

            const res = await Taro.request({
                method: 'POST',
                url: 'http://43.161.237.243/api/auth/login',
                data: { code, encryptedData, iv }
            });

            console.log("🚀 ~ onGetPhoneNumber ~ res:", res)

            if (res.statusCode === 200) {
                const { token } = res.data;

                onSuccess && onSuccess(token, userInfo);

                Taro.showToast({
                    title: '登录成功',
                    icon: 'success'
                });
            }
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
            openType='getPhoneNumber'
            onGetPhoneNumber={handleGetPhoneNumber}
            loading={isLogin}
            className={`login-button`}
        >
            微信一键登录
        </Button>
    );
}

export default WeappLoginButton;