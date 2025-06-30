import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import styles from "./index.module.less";

interface ContractPartProps {
  onContractList?: () => void;
}

const ContractPart = ({ onContractList }: ContractPartProps) => {
  const handleContractList = () => {
    console.log("查看合同列表");
    Taro.navigateTo({
      url: "/pages/contract-list/index",
    });
    onContractList?.();
  };

  return (
    <View className={styles.contract_part}>
      <View className={styles.contract_item} onClick={handleContractList}>
        <View className={styles.contract_item_left}>
          <View className={styles.contract_icon}>
            <Text className={styles.icon_text}>📄</Text>
          </View>
          <Text className={styles.contract_text}>我的合同</Text>
        </View>
        <View className={styles.arrow}>
          <Text>➡️</Text>
        </View>
      </View>
    </View>
  );
};

export default ContractPart;