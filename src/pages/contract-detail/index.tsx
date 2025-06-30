import React, { useEffect } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useContractStore } from '@/store/contract';
import { localizeDate } from '@/utils/date';
import { BASE_API_URL } from '@/constants';
import styles from './index.module.less';

const ContractDetail: React.FC = () => {
  const router = useRouter();
  const contractId = Number(router.params.id);
  
  const currentContract = useContractStore(state => state.currentContract);
  const loading = useContractStore(state => state.loading);
  const error = useContractStore(state => state.error);
  const fetchContractDetail = useContractStore(state => state.fetchContractDetail);
  const clearCurrentContract = useContractStore(state => state.clearCurrentContract);
  const clearError = useContractStore(state => state.clearError);

  useEffect(() => {
    if (contractId && !isNaN(contractId)) {
      fetchContractDetail(contractId);
    }
    
    return () => {
      clearCurrentContract();
      clearError();
    };
  }, [contractId]); // 保留 contractId 依赖

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '有效';
      case 'expired':
        return '已过期';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.status_active;
      case 'expired':
        return styles.status_expired;
      case 'cancelled':
        return styles.status_cancelled;
      default:
        return styles.status_default;
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleImagePreview = (imageUrl: string) => {
    Taro.previewImage({
      urls: [imageUrl],
      current: imageUrl
    });
  };

  if (loading) {
    return (
      <View className={styles.container}>
        <View className={styles.loading}>
          <Text className={styles.loading_text}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className={styles.container}>
        <View className={styles.error}>
          <Text className={styles.error_text}>{error}</Text>
          <Button 
            className={styles.retry_button}
            onClick={() => fetchContractDetail(contractId)}
          >
            重试
          </Button>
        </View>
      </View>
    );
  }

  if (!currentContract) {
    return (
      <View className={styles.container}>
        <View className={styles.error}>
          <Text className={styles.error_text}>合同不存在</Text>
          <Button 
            className={styles.back_button}
            onClick={handleBack}
          >
            返回
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      {/* 页面标题 */}
      <View className={styles.page_header}>
        <Text className={styles.page_title}>合同详情</Text>
      </View>

      {/* 合同基本信息 */}
      <View className={styles.main_content}>
        {/* 合同头部卡片 */}
        <View className={styles.contract_header_card}>
          <View className={styles.header_top}>
            <View className={styles.contract_info}>
              <Text className={styles.contract_number}>
                {currentContract.title}
              </Text>
              <Text className={styles.signing_date}>
                创建于 {localizeDate(currentContract.created_at)}
              </Text>
            </View>
            <View className={`${styles.status_badge} ${getStatusClass(currentContract.status)}`}>
              <Text className={styles.status_text}>
                {getStatusText(currentContract.status)}
              </Text>
            </View>
          </View>
          
          {/* 合同图片 - 详情页显示原始大图 */}
          {currentContract.contract_image && (
            <View style={{
              marginTop: '16px',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <Image 
                src={`${BASE_API_URL}${currentContract.contract_image}`}
                style={{
                  width: '100%',
                  height: '200px'
                }}
                mode="aspectFit"
                onClick={() => handleImagePreview(`${BASE_API_URL}${currentContract.contract_image}`)}
              />
              <View style={{
                textAlign: 'center',
                padding: '8px',
                background: '#f8f9fa',
                fontSize: '12px',
                color: '#666'
              }}>
                <Text>点击图片查看原图</Text>
              </View>
            </View>
          )}
        </View>

        {/* 详细信息卡片 */}
        <View className={styles.detail_card}>
          <Text className={styles.card_title}>合同信息</Text>
          
          <View className={styles.info_grid}>
            <View className={styles.info_item}>
              <Text className={styles.info_label}>合同ID</Text>
              <Text className={styles.info_value}>{currentContract.uid}</Text>
            </View>
            
            <View className={styles.info_item}>
              <Text className={styles.info_label}>创建时间</Text>
              <Text className={styles.info_value}>
                {localizeDate(currentContract.created_at)}
              </Text>
            </View>
            
            <View className={styles.info_item}>
              <Text className={styles.info_label}>合同状态</Text>
              <Text className={`${styles.info_value} ${getStatusClass(currentContract.status)}`}>
                {getStatusText(currentContract.status)}
              </Text>
            </View>
            
            {currentContract.description && (
              <View className={styles.info_item}>
                <Text className={styles.info_label}>合同描述</Text>
                <Text className={styles.info_value}>
                  {currentContract.description}
                </Text>
              </View>
            )}
            
            <View className={styles.info_item}>
              <Text className={styles.info_label}>创建者</Text>
              <Text className={styles.info_value}>
                {currentContract.created_by}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View className={styles.footer_actions}>
        <Button 
          className={styles.action_button}
          onClick={() => {
            Taro.showToast({
              title: '功能开发中',
              icon: 'none'
            });
          }}
        >
          💬 联系客服
        </Button>
      </View>
    </View>
  );
};

export default ContractDetail;