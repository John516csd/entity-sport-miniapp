import { View } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import styles from './index.module.less'
import HomeHeroBanner from '../../components/home-hero-banner'
import CtaContainer from '../../components/cta-container'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className={styles.wrapper}>
      {/* Hero banner */}
      <HomeHeroBanner />
      {/* CTA */}
      <CtaContainer />
    </View>
  )
}
