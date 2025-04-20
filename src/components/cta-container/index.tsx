import { View, Image, Text } from '@tarojs/components'
import styles from './index.module.less'
import Gymnasium from '../../assets/index/gymnasium.png';
import BookTime from '../../assets/index/book-time.png';

const CtaContainer = () => {
    return (
        <View className={styles.cta_container}>
            <View className={styles.cta_item}>
                <Image src={Gymnasium} className={styles.cta_item_image} />
                <Text className={styles.cta_item_subtitle}>GO TO GYM</Text>
                <Text className={styles.cta_item_title}>去健身房</Text>
                <Text className={styles.cta_item_distance}>距您 3km</Text>
            </View>
            <View className={styles.cta_item}>
                <Image src={BookTime} className={styles.cta_item_image} />
                <Text className={styles.cta_item_subtitle}>BOOK A COACH</Text>
                <Text className={styles.cta_item_title}>预约教练</Text>
                <Text className={`${styles.cta_item_distance} ${styles.cta_item_placeholder}`}>距您 3km</Text>
            </View>
        </View>
    )
}

export default CtaContainer;