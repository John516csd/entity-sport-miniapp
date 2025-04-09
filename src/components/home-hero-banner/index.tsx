import { View, Image, Text } from '@tarojs/components'
import styles from './index.module.less'
import EntityLogo from '../../assets/index/entity-logo.png'

const HomeHeroBanner = () => {
    return <View className={styles.wrapper}>
        <View className={styles.logo_box}>
            <View className={styles.logo_wrapper}>
                <Image src={EntityLogo} className={styles.logo} />
            </View>
            {/* <View className={`${styles.emoji_box} ${styles.strong}`}>
                <Text className={styles.emoji}>💪</Text>
            </View>
            <View className={`${styles.emoji_box} ${styles.love}`}>
                <Text className={styles.emoji}>❤️</Text>
            </View>
            <View className={`${styles.emoji_box} ${styles.yoga}`}>
                <Text className={styles.emoji}>🧘‍♀️</Text>
            </View>
            <View className={`${styles.emoji_box} ${styles.run}`}>
                <Text className={styles.emoji}>🏃</Text>
            </View> */}
        </View>
    </View>
}

export default HomeHeroBanner;