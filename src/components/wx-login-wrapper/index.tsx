// 微信授权登录按钮示例（获取用户基础信息）
import { Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./index.less";
import { login, User, UserInfoWechat } from "@/api";

interface WeappLoginButtonProps {
  className?: string;
  onSuccess?: (token: string, userInfoWechat?: UserInfoWechat, userInfo?: User) => void;
}

function WeappLoginButton(props: WeappLoginButtonProps) {
  const { onSuccess } = props;
  const [isLogin, setIsLogin] = useState(false);

  // 处理获取用户信息
  const handleGetUserInfo = async (): Promise<UserInfoWechat | undefined> => {
    try {
      const modalRes = await Taro.showModal({
        title: "授权提示",
        content: "需要获取您的头像、昵称等信息",
        confirmText: "确认授权",
        cancelText: "暂不授权",
      });

      if (modalRes.confirm) {
        const profileRes = await Taro.getUserProfile({
          desc: "用于完善会员资料",
        });
        console.log("🚀 ~ handleGetUserInfo ~ profileRes:", profileRes);

        const { userInfo } = profileRes;
        return userInfo as UserInfoWechat;
      } else {
        Taro.showToast({
          title: "您已取消授权",
          icon: "none",
        });
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
      Taro.showToast({
        title: "获取用户信息失败",
        icon: "none",
      });
    }
  };

  async function handleGetPhoneNumber(e?) {
    try {
      setIsLogin(true);

      // 如果是通过按钮直接触发的，检查错误信息
      if (e && e.detail.errMsg && e.detail.errMsg !== "getPhoneNumber:ok") {
        throw new Error(e.detail.errMsg);
      }

      const userInfoWechat = await handleGetUserInfo();

      // 获取登录code
      const loginResult = await Taro.login();
      if (!loginResult.code) {
        throw new Error("登录失败,未获取到code");
      }

      const { code } = loginResult;
      const encryptedData = e?.detail?.encryptedData;
      const iv = e?.detail?.iv;

      // 打印调试信息
      console.log("🚀 ~ onGetUserInfo ~ code:", code);
      console.log("🚀 ~ onGetPhoneNumber ~ detail:", e?.detail);

      // 使用封装的请求方法
      const res = await login(code);
      console.log("🚀 ~ handleGetPhoneNumber ~ res:", res);

      const { access_token, user } = res;

      // 确保存储token正确
      if (access_token) {
        try {
          Taro.setStorageSync('token', access_token);
          console.log('Token saved successfully:', access_token);
          console.log('Storage keys after save:', Taro.getStorageInfoSync().keys);
        } catch (storageError) {
          console.error('Failed to save token:', storageError);
        }
      } else {
        console.error('No access_token in response:', res);
      }

      onSuccess && onSuccess(access_token, userInfoWechat, user);

      Taro.showToast({
        title: "登录成功",
        icon: "success",
      });
    } catch (error) {
      console.error("登录失败:", error);
      Taro.showToast({
        title: "登录失败",
        icon: "none",
      });
    } finally {
      setIsLogin(false);
    }
  }

  return (
    <Button
      openType="getPhoneNumber"
      onGetPhoneNumber={handleGetPhoneNumber}
      loading={isLogin}
      className={`login-button`}
    >
      微信一键登录
    </Button>
  );
}

export default WeappLoginButton;
