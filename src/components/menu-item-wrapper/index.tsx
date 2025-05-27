import { View } from "@tarojs/components";
import styles from './index.module.less';

interface MenuItemWrapperProps {
    children: React.ReactNode;
    label?: string;
}

const MenuItemWrapper = ({ children, label }: MenuItemWrapperProps) => {
    return (
        <View className={styles.wrapper}>
            {label && <View className={styles.label}>{label}</View>}
            {children}
        </View>
    );
}

export default MenuItemWrapper;