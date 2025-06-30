// 微信授权登录按钮示例（获取用户基础信息）
import { Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { login, User } from "@/api";
import "./index.less";

interface WeappLoginButtonProps {
  className?: string;
  onSuccess?: (token: string, userInfo?: User) => void;
}

function WeappLoginButton(props: WeappLoginButtonProps) {
  const { onSuccess } = props;
  const [isLogin, setIsLogin] = useState(false);


  // 检查用户是否需要完善资料
  const checkUserProfileComplete = (user: User | undefined): boolean => {
    if (!user) return false;
    // 检查是否有头像和昵称
    const hasAvatar = Boolean(user.avatar_url);
    const hasNickname = Boolean(user.name && user.name !== '微信用户');

    console.log("hasAvatar", hasAvatar);
    console.log("hasNickname", hasNickname);
    console.log("user", user);
    return hasAvatar && hasNickname;
  };


  // 处理手机号授权登录
  async function handleGetPhoneNumber(e?: any) {
    try {
      setIsLogin(true);

      // 如果是通过按钮直接触发的，检查错误信息
      if (e && e.detail.errMsg && e.detail.errMsg !== "getPhoneNumber:ok") {
        throw new Error(e.detail.errMsg);
      }

      // 获取登录code
      const loginResult = await Taro.login();
      if (!loginResult.code) {
        throw new Error("登录失败,未获取到code");
      }

      const { code } = loginResult;

      // 先尝试仅使用手机号登录，获取基本用户信息
      const basicLoginRes = await login({ code });
      const { access_token, user_info: basicUserInfo } = basicLoginRes;

      // 确保存储token正确
      if (access_token) {
        Taro.setStorageSync("token", access_token);
      } else {
        throw new Error("登录响应中没有access_token");
      }

      // 检查用户资料是否完整
      const isProfileComplete = checkUserProfileComplete(basicUserInfo);
      let finalUserInfo = basicUserInfo;

      if (!isProfileComplete) {
        // 用户资料不完整，询问是否要完善资料
        try {
          const modalRes = await Taro.showModal({
            title: "完善资料",
            content: "为了更好的使用体验，建议您完善头像和昵称信息",
            confirmText: "去完善",
            cancelText: "稍后再说",
          });

          if (modalRes.confirm) {
            // 引导用户到个人资料编辑页面手动完善
            Taro.showToast({
              title: "即将跳转到资料编辑页",
              icon: "none",
              duration: 1500,
            });
            
            setTimeout(() => {
              Taro.navigateTo({
                url: '/pages/profile-edit/index'
              });
            }, 1500);
          }
        } catch (profileError) {
          console.warn("获取用户信息失败，使用基本信息:", profileError);
          // 用户拒绝授权或其他错误，使用基本信息继续
        }
      }

      // 完成登录流程
      onSuccess && onSuccess(access_token, finalUserInfo);

      Taro.showToast({
        title: "登录成功",
        icon: "success",
      });

      // 处理页面跳转
      const redirectUrl = Taro.getStorageSync('redirect_after_login');
      if (redirectUrl) {
        // 清除重定向信息
        Taro.removeStorageSync('redirect_after_login');
        
        // 延迟跳转，让toast显示完
        setTimeout(() => {
          const pages = Taro.getCurrentPages();
          if (pages.length === 1) {
            Taro.reLaunch({
              url: redirectUrl
            });
          } else {
            Taro.navigateBack();
          }
        }, 1500);
      } else {
        // 如果没有重定向页面，根据当前页面决定是否跳转
        const pages = Taro.getCurrentPages();
        const currentPage = pages[pages.length - 1];
        
        // 如果当前在登录页面，则跳转到首页；如果在其他页面（如个人资料页），则留在当前页面
        if (currentPage?.route === 'pages/login/index') {
          setTimeout(() => {
            Taro.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500);
        }
        // 在其他页面登录成功后不跳转，留在当前页面
      }
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
      openType='getPhoneNumber'
      onGetPhoneNumber={handleGetPhoneNumber}
      loading={isLogin}
      className='login-button'
    >
      手机号快捷登录
    </Button>
  );
}

export default WeappLoginButton;
