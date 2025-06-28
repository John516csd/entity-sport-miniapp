// 微信授权登录按钮示例（获取用户基础信息）
import { Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./index.less";
import { login, User } from "@/api";

interface WeappLoginButtonProps {
  className?: string;
  onSuccess?: (token: string, userInfo?: User) => void;
}

function WeappLoginButton(props: WeappLoginButtonProps) {
  const { onSuccess } = props;
  const [isLogin, setIsLogin] = useState(false);


  // 处理获取用户信息
  const handleGetUserInfo = async (): Promise<{
    encryptedData: string;
    iv: string;
  }> => {
    try {
      const profileRes = await Taro.getUserProfile({
        desc: "用于完善会员资料",
      });

      const { encryptedData, iv } = profileRes;
      return { encryptedData, iv };
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 即使获取用户信息失败，也允许继续登录
      return { encryptedData: "", iv: "" };
    }
  };

  async function handleGetPhoneNumber(e?) {
    try {
      setIsLogin(true);

      // 如果是通过按钮直接触发的，检查错误信息
      if (e && e.detail.errMsg && e.detail.errMsg !== "getPhoneNumber:ok") {
        throw new Error(e.detail.errMsg);
      }

      const { encryptedData, iv } = await handleGetUserInfo();

      // 获取登录code
      const loginResult = await Taro.login();
      if (!loginResult.code) {
        throw new Error("登录失败,未获取到code");
      }

      const { code } = loginResult;

      // 使用封装的请求方法
      const res = await login({
        code,
        encrypted_data: encryptedData,
        iv: iv,
      });

      const { access_token, user_info } = res;

      // 确保存储token正确
      if (access_token) {
        Taro.setStorageSync("token", access_token);
      } else {
        throw new Error("登录响应中没有access_token");
      }

      onSuccess && onSuccess(access_token, user_info);

      Taro.showToast({
        title: "登录成功",
        icon: "success",
      });
    } catch (error) {
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
      手机号快捷登录
    </Button>
  );
}

export default WeappLoginButton;
