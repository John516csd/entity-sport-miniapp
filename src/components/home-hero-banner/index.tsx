import { View, Image } from '@tarojs/components'
import styles from './index.module.less'
import EntityLogo from '../../assets/index/entity-logo.png'

const HomeHeroBanner = () => {
    return <View className={styles.wrapper}>
        <View className={styles.logo_wrapper}>
            <Image src={EntityLogo} className={styles.logo} />
        </View>
    </View>
}

export default HomeHeroBanner;