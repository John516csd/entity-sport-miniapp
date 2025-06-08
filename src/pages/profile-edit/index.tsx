import { View, Text, Image, Input, Button } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import React, { useState, useEffect, useMemo } from "react";
import { useUserStore } from "@/store/user";
import { useStore } from "@/hooks/useStore";
import styles from "./index.module.less";
import DefaultAvatar from "@/assets/profile/default-avatar.png";
import { updateCurrentUser } from "@/api/user";

// Assume an API function exists for updating profile.
// import { updateUserProfile } from "@/api/user"; // You'll need to create/uncomment this

const ProfileEdit: React.FC = () => {
  const userState = useStore(useUserStore);
  const { setUser } = useUserStore;

  const [avatarUrl, setAvatarUrl] = useState<string>(DefaultAvatar);
  const [nickname, setNickname] = useState<string>("");
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string>("");
  const [originalNickname, setOriginalNickname] = useState<string>("");

  useLoad(() => {
    // Initialize with current user data
    if (userState.user) {
      const currentAvatar = userState.user.avatar_url || DefaultAvatar;
      const currentNickname = userState.user.name || "";
      setAvatarUrl(currentAvatar);
      setNickname(currentNickname);
      setOriginalAvatarUrl(currentAvatar);
      setOriginalNickname(currentNickname);
    }
  });

  const handleAvatarChoose = (event) => {
    const { avatarUrl: tempAvatarUrl } = event.detail;
    if (tempAvatarUrl) {
      setAvatarUrl(tempAvatarUrl);
      // Here you might want to upload the tempAvatarUrl to your server
      // and get a permanent URL if WeChat's URL is temporary.
      // For now, we'll just use the temp URL.
      console.log("New avatar chosen:", tempAvatarUrl);
    }
  };

  const handleNicknameInput = (event) => {
    setNickname(event.detail.value);
  };

  const handleSaveChanges = async () => {
    if (!userState.user) {
      Taro.showToast({ title: "User data not loaded.", icon: "none" });
      return;
    }

    // TODO: Implement the actual API call to update the profile
    // For example:
    try {
      Taro.showLoading({ title: "Saving..." });
      const updatedProfile = await updateCurrentUser({
        name: nickname,
        avatar_url: avatarUrl, // This might need to be the uploaded URL if different from chosen one
      });
      setUser(updatedProfile); // Update store with response from API
      Taro.hideLoading();
      Taro.showToast({ title: "Profile updated!", icon: "success" });
      Taro.navigateBack();
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({ title: "Failed to update profile.", icon: "none" });
      console.error("Failed to save profile:", error);
    }

    // Placeholder for actual save logic - simulating API call
    console.log("Saving changes:", { nickname, avatarUrl });

    // Update user state in the store with new data
    const updatedUser = {
      ...userState.user,
      name: nickname,
      avatar_url: avatarUrl,
    };
    setUser(updatedUser);

    // Also update local storage
    await Taro.setStorage({
      key: "userInfo",
      data: updatedUser,
    });

    Taro.showToast({ title: "个人信息已保存", icon: "success" });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const canSaveChanges = useMemo(() => {
    // Ensure user object exists before comparing its properties
    if (!userState.user) return false;
    // Also, make sure original values are set before allowing save
    if (originalAvatarUrl === "" && originalNickname === "") return false;

    const avatarChanged = avatarUrl !== originalAvatarUrl;
    const nicknameChanged =
      nickname !== originalNickname && nickname.trim() !== ""; // ensure nickname is not just empty spaces
    console.log("avatarChanged", avatarChanged);
    console.log("nicknameChanged", nicknameChanged);
    return avatarChanged || nicknameChanged;
  }, [
    avatarUrl,
    nickname,
    originalAvatarUrl,
    originalNickname,
    userState.user,
  ]);

  return (
    <View className={styles.container}>
      <View className={styles.formItem}>
        <Text className={styles.label}>头像</Text>
        <Button
          className={styles.avatarButton}
          openType="chooseAvatar"
          onChooseAvatar={handleAvatarChoose}
        >
          <Image
            src={avatarUrl}
            className={styles.avatarImage}
            mode="aspectFill"
          />
        </Button>
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>昵称</Text>
        <Input
          className={styles.nicknameInput}
          type="nickname"
          placeholder="请输入昵称"
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
