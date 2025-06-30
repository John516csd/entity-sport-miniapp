import React, { useEffect } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MembershipContractResponse } from '@/api/types';
import { useContractStore } from '@/store/contract';
import { localizeDate } from '@/utils/date';
import { BASE_API_URL } from '@/constants';

// API连通性测试
const testApiConnection = async () => {
  try {
    console.log('正在测试API连接:', BASE_API_URL);
    
    // 测试一个简单的API端点
    const response = await Taro.request({
      url: `${BASE_API_URL}/api/v1/contracts/my-contracts`,
      method: 'GET',
      timeout: 10000,
      header: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API连接测试结果:', response);
    // 即使返回401认证错误，也说明API服务器是可达的
    return response.statusCode === 200 || response.statusCode === 401;
  } catch (error: any) {
    console.error('API连接测试失败:', error);
    // 检查具体的错误类型
    if (error?.errMsg?.includes('request:fail')) {
      console.error('请求失败，可能是网络问题或域名不在白名单中');
    }
    return false;
  }
};

const ContractList: React.FC = () => {
  const contracts = useContractStore(state => state.contracts);
  const loading = useContractStore(state => state.loading);
  const error = useContractStore(state => state.error);
  const fetchContracts = useContractStore(state => state.fetchContracts);

  useEffect(() => {
    // 清除可能存在的旧缓存
    Taro.removeStorageSync('contract-storage');
    Taro.removeStorageSync('contract-storage-v2');
    
    // 检查网络状态和API连通性
    Taro.getNetworkType().then(async (res) => {
      console.log('网络状态:', res.networkType);
      if (res.networkType === 'none') {
        Taro.showToast({
          title: '网络连接不可用',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 测试API连通性
      const apiConnected = await testApiConnection();
      if (!apiConnected) {
        Taro.showModal({
          title: '网络诊断',
          content: `无法连接到API服务器(${BASE_API_URL})。\n\n可能原因：\n1. 网络连接不稳定\n2. 服务器暂时不可用\n3. 域名未加入微信小程序白名单\n\n请稍后重试或联系管理员`,
          showCancel: true,
          cancelText: '取消',
          confirmText: '仍要尝试',
          success: (res) => {
            if (res.confirm) {
              fetchContracts();
            }
          }
        });
        return;
      }
      
      fetchContracts();
    }).catch(() => {
      // 如果获取网络状态失败，仍然尝试请求
      fetchContracts();
    });
  }, []); // 移除 fetchContracts 依赖，避免无限循环

  const handleContractClick = (contract: MembershipContractResponse) => {
    Taro.navigateTo({
      url: `/pages/contract-detail/index?id=${contract.id}`
    });
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'expired':
        return '#f44336';
      case 'cancelled':
        return '#9e9e9e';
      default:
        return '#2196f3';
    }
  };

  const handleImagePreview = (imageUrl: string) => {
    Taro.previewImage({
      urls: [imageUrl],
      current: imageUrl
    });
  };

  if (loading) {
    return (
      <View style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{ fontSize: '18px', color: '#7f8c8d' }}>加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <Text style={{ fontSize: '40px', marginBottom: '12px' }}>❌</Text>
        <Text style={{ fontSize: '16px', color: '#e74c3c', marginBottom: '16px' }}>{error}</Text>
        <Button 
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px'
          }}
          onClick={() => {
            // 重试时也检查网络和API连通性
            Taro.getNetworkType().then(async (res) => {
              if (res.networkType === 'none') {
                Taro.showToast({
                  title: '网络连接不可用',
                  icon: 'none',
                  duration: 2000
                });
                return;
              }
              
              // 测试API连通性
              const apiConnected = await testApiConnection();
              if (!apiConnected) {
                Taro.showModal({
                  title: '网络诊断',
                  content: `无法连接到API服务器(${BASE_API_URL})。\n\n可能原因：\n1. 网络连接不稳定\n2. 服务器暂时不可用\n3. 域名未加入微信小程序白名单\n\n请稍后重试或联系管理员`,
                  showCancel: true,
                  cancelText: '取消',
                  confirmText: '仍要尝试',
                  success: (res) => {
                    if (res.confirm) {
                      fetchContracts();
                    }
                  }
                });
                return;
              }
              
              fetchContracts();
            }).catch(() => {
              fetchContracts();
            });
          }}
        >
          重试
        </Button>
      </View>
    );
  }

  if (!loading && (!contracts || contracts.length === 0)) {
    return (
      <View style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <Text style={{ fontSize: '60px', marginBottom: '16px' }}>📄</Text>
        <Text style={{ fontSize: '20px', color: '#2c3e50', fontWeight: 'bold', marginBottom: '8px' }}>暂无合同记录</Text>
        <Text style={{ fontSize: '16px', color: '#7f8c8d' }}>您的合同信息会在这里显示</Text>
      </View>
    );
  }

  return (
    <View style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '12px'
    }}>
      {/* 头部 */}
      <View style={{
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <Text style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2c3e50',
          marginBottom: '8px'
        }}>我的合同</Text>
        <Text style={{
          fontSize: '24px',
          color: '#7f8c8d'
        }}>共 {contracts?.length || 0} 份合同</Text>
      </View>

      {/* 合同列表 */}
      <View style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {(contracts || []).map((contract) => {
          return (
          <View 
            key={contract.id}
            style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              width: '100%',
              height: '200px', // 固定高度实现2:1比例 (假设宽度400px)
              display: 'flex',
              flexDirection: 'row'
            }}
            onClick={() => handleContractClick(contract)}
          >
            {/* 左侧图片区域 */}
            <View style={{
              width: '80px',
              height: '200px',
              position: 'relative',
              flexShrink: 0,
              borderRadius: '8px 0 0 8px',
              overflow: 'hidden'
            }}>
              {contract.contract_image ? (
                <>
                  <Image 
                    src={`${BASE_API_URL}${contract.contract_image}`}
                    style={{
                      width: '80px',
                      height: '200px',
                      display: 'block'
                    }}
                    mode="aspectFill"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      handleImagePreview(`${BASE_API_URL}${contract.contract_image}`);
                    }}
                  />
                  <View style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}>
                    <Text style={{
                      fontSize: '10px',
                      color: '#fff'
                    }}>🔍</Text>
                  </View>
                </>
              ) : (
                <View style={{
                  width: '80px',
                  height: '200px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{
                    fontSize: '24px',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>📄</Text>
                </View>
              )}
            </View>

            {/* 右侧内容区域 */}
            <View style={{
              flex: 1,
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 12px',
              position: 'relative'
            }}>
              {/* 右上角：合同名称 */}
              <View style={{
                marginBottom: '12px'
              }}>
                <Text style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  lineHeight: '1.3',
                  wordBreak: 'break-all'
                }}>{contract.title}</Text>
              </View>
              
              {/* 中间：合同描述和状态 */}
              <View style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}>
                {/* 合同描述 */}
                {contract.description && (
                  <Text style={{
                    fontSize: '13px',
                    color: '#666',
                    lineHeight: '1.4',
                    marginBottom: '12px',
                    wordBreak: 'break-all'
                  }}>{contract.description.length > 40 ? contract.description.substring(0, 40) + '...' : contract.description}</Text>
                )}
                
                {/* 合同状态 */}
                <View style={{
                  marginBottom: '8px'
                }}>
                  <View style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: getStatusColor(contract.status) + '20',
                    alignSelf: 'flex-start'
                  }}>
                    <Text style={{ 
                      fontSize: '11px', 
                      color: getStatusColor(contract.status),
                      fontWeight: 'bold'
                    }}>{getStatusText(contract.status)}</Text>
                  </View>
                </View>

                {/* 创建时间 */}
                <Text style={{
                  fontSize: '12px',
                  color: '#7f8c8d'
                }}>创建于 {localizeDate(contract.created_at)}</Text>
              </View>

              {/* 右下角：查看详情入口 */}
              <View style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px'
              }}>
                <Text style={{
                  fontSize: '12px',
                  color: '#667eea',
                  fontWeight: 'bold'
                }}>查看详情 ›</Text>
              </View>
            </View>
          </View>
          );
        })}
      </View>
    </View>
  );
};

export default ContractList;