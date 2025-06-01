import { View, Image } from "@tarojs/components";
import styles from "./index.module.less";
import EditIcon from "@/assets/icons/edit.png";

interface ProfileCardProps {
  name: string;
  avatarUrl: string;
  onEditClick: () => void;
}

const ProfileCard = ({ name, avatarUrl, onEditClick }: ProfileCardProps) => {
  return (
    <View className={styles.profile_card}>
      <View className={styles.profile_card_content}>
        <View className={styles.profile_card_avatar}>
          <Image src={avatarUrl} className={styles.profile_card_avatar_image} />
        </View>
        <View className={styles.profile_card_name}>{name}</View>
      </View>
      <View className={styles.profile_card_actions}>
        <View
          className={styles.profile_card_actions_item}
          onClick={onEditClick}
        >
          <Image src={EditIcon} className={styles.profile_card_actions_icon} />
        </View>
      </View>
    </View>
  );
};

export default ProfileCard;
