import { View, Button } from '@tarojs/components'
import Taro, { useLoad, navigateTo } from '@tarojs/taro'
import styles from './index.module.less'
import HomeHeroBanner from '../../components/home-hero-banner'
import CtaContainer from '../../components/cta-container'
import { useGlobalModalManager } from '@/hooks/useTabSwitchReset'

export default function Index() {
  useLoad(() => {})

  // 使用全局模态框管理（只关闭弹窗）
  const { closeAllModals } = useGlobalModalManager();
  
  // 页面隐藏时关闭所有模态框
  Taro.useDidHide(() => {
    closeAllModals();
  });

  const goToTestPage = () => {
    navigateTo({ url: '/pages/test/index' })
  }

  return (
    <View className={styles.wrapper}>
      {/* Hero banner */}
      <HomeHeroBanner />
      {/* CTA */}
      <CtaContainer />

      {/* 测试页面按钮 */}
      {/* <View style={{ padding: '20px', position: 'fixed', bottom: '80px', right: '20px' }}>
        <Button 
          onClick={goToTestPage}
          style={{ 
            backgroundColor: '#007AFF', 
            color: 'white', 
            borderRadius: '50%', 
            width: '60px', 
            height: '60px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '14px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
          }}
        >
          测试
        </Button>
      </View> */}
    </View>
  )
}
