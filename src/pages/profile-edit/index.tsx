import { View, Text, Image, Input, Button } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import React, { useState, useEffect, useMemo } from "react";
import { useUserStore } from "@/store/user";
import { useStore } from "@/hooks/useStore";
import styles from "./index.module.less";
import DefaultAvatar from "@/assets/profile/default-avatar.png";
import { updateCurrentUser, updateCurrentUserWithFile } from "@/api/user";
import { User } from "@/api/types";

// Assume an API function exists for updating profile.
// import { updateUserProfile } from "@/api/user"; // You'll need to create/uncomment this

const ProfileEdit: React.FC = () => {
  const userState = useStore(useUserStore);
  const { setUser } = useUserStore;

  const [avatarUrl, setAvatarUrl] = useState<string>(DefaultAvatar);
  const [nickname, setNickname] = useState<string>("");
  const [originalNickname, setOriginalNickname] = useState<string>("");
  const [tempAvatarPath, setTempAvatarPath] = useState<string>("");

  useLoad(() => {
    // Initialize with current user data
    if (userState.user) {
      const currentAvatar = userState.user.avatar_url || DefaultAvatar;
      const currentNickname = userState.user.name || "";
      setAvatarUrl(currentAvatar);
      setNickname(currentNickname);
      setOriginalNickname(currentNickname);
    }
  });

  const handleAvatarChoose = (event: any) => {
    const { avatarUrl: tempAvatarUrl } = event.detail;
    if (tempAvatarUrl) {
      console.log("WeChat temporary avatar URL:", tempAvatarUrl);
      
      // 保存微信临时文件路径用于上传
      setTempAvatarPath(tempAvatarUrl);
      
      // 显示选择的头像预览
      setAvatarUrl(tempAvatarUrl);
      
      console.log("Avatar selected, will upload on save:", tempAvatarUrl);
    }
  };

  const handleNicknameInput = (event: any) => {
    setNickname(event.detail.value);
  };

  const handleSaveChanges = async () => {
    if (!userState.user) {
      Taro.showToast({ title: "用户数据未加载", icon: "none" });
      return;
    }

    try {
      // 准备更新数据
      const updateData = {
        name: nickname,
      };

      let updatedProfile: User;
      
      // 如果有新头像需要上传
      if (tempAvatarPath) {
        console.log("Uploading avatar with user data:", updateData);
        updatedProfile = await updateCurrentUserWithFile(updateData, tempAvatarPath);
      } else {
        console.log("Updating user data without avatar:", updateData);
        updatedProfile = await updateCurrentUser(updateData);
      }

      // 更新本地状态
      setUser(updatedProfile);
      
      // 更新本地存储
      await Taro.setStorage({
        key: "userInfo",
        data: updatedProfile,
      });

      Taro.showToast({ title: "个人信息已保存", icon: "success" });
      
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
      
    } catch (error) {
      console.error("Failed to save profile:", error);
      Taro.showToast({ 
        title: error.message || "保存失败，请重试", 
        icon: "none" 
      });
    }
  };

  const canSaveChanges = useMemo(() => {
    // Ensure user object exists before comparing its properties
    if (!userState.user) return false;

    const avatarChanged = tempAvatarPath !== ""; // 有新头像选择
    const nicknameChanged = nickname !== originalNickname; // 昵称有变化
    
    console.log("avatarChanged", avatarChanged);
    console.log("nicknameChanged", nicknameChanged);
    console.log("current nickname:", nickname);
    console.log("original nickname:", originalNickname);
    
    return avatarChanged || nicknameChanged;
  }, [
    tempAvatarPath,
    nickname,
    originalNickname,
    userState.user,
  ]);

  return (
    <View className={styles.container}>
      <View className={styles.formItem}>
        <Text className={styles.label}>头像</Text>
        <Button
          className={styles.avatarButton}
          openType='chooseAvatar'
          onChooseAvatar={handleAvatarChoose}
        >
          <Image
            src={avatarUrl}
            className={styles.avatarImage}
            mode='aspectFill'
          />
        </Button>
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>昵称</Text>
        <Input
          className={styles.nicknameInput}
          type='nickname'
          placeholder='请输入昵称'
          value={nickname}
          onInput={handleNicknameInput}
        />
      </View>
      <Text className={styles.nicknameHint}>
        昵称限2-32个字符，一个汉字为2个字符
      </Text>

      <Button
        className={`${styles.saveButton} ${
          !canSaveChanges ? styles.disabledButton : ""
        }`}
        onClick={handleSaveChanges}
        disabled={!canSaveChanges}
      >
        保存
      </Button>
      <Button
        className={styles.cancelButton}
        onClick={() => Taro.navigateBack()}
      >
        取消
      </Button>
    </View>
  );
};

export default ProfileEdit;
