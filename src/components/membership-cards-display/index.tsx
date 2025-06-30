import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MembershipResponse } from '@/api/types';
import VipCard from '../vip-card';
import { localizeDate } from '@/utils/date';
import { CardType, getCardTypeName } from '@/types';
import styles from './index.module.less';

interface MembershipCardsDisplayProps {
    memberships: MembershipResponse[];
    selectedMembership?: MembershipResponse | null;
    onCardSelect?: (membership: MembershipResponse) => void;
    showSelector?: boolean;
}

const MembershipCardsDisplay: React.FC<MembershipCardsDisplayProps> = ({
    memberships,
    selectedMembership,
    onCardSelect,
    showSelector = false
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [translateX, setTranslateX] = useState(0);

    // 如果只有一张卡，直接显示
    if (memberships.length === 0) {
        return (
            <View className={styles.container}>
                <View className={styles.empty_state}>
                    <Text className={styles.empty_text}>暂无会员卡</Text>
                </View>
            </View>
        );
    }

    if (memberships.length === 1) {
        const membership = memberships[0];
        return (
            <View className={styles.container}>
                <VipCard
                  cardName={getCardTypeName(membership.type_id as CardType)}
                  remainingDays={membership.remaining_sessions}
                  expireDate={localizeDate(membership.expired_at)}
                />
            </View>
        );
    }

    // 多张卡的情况
    const handlePrevCard = () => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : memberships.length - 1;
        setCurrentIndex(newIndex);
        
        // 添加震动反馈
        Taro.vibrateShort();
        
        if (onCardSelect) {
            onCardSelect(memberships[newIndex]);
        }
    };

    const handleNextCard = () => {
        const newIndex = currentIndex < memberships.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        
        // 添加震动反馈
        Taro.vibrateShort();
        
        if (onCardSelect) {
            onCardSelect(memberships[newIndex]);
        }
    };

    // 拖拽处理函数
    const handleTouchStart = (e: any) => {
        setTouchStartX(e.touches[0].clientX);
        setTouchEndX(e.touches[0].clientX);
        setIsDragging(true);
    };

    const handleTouchMove = (e: any) => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        setTouchEndX(currentX);
        
        // 计算当前的位移
        const deltaX = currentX - touchStartX;
        const maxTranslate = 100; // 最大位移限制
        
        // 限制位移范围，提供阻力效果
        let limitedDeltaX = deltaX;
        if (Math.abs(deltaX) > maxTranslate) {
            limitedDeltaX = Math.sign(deltaX) * (maxTranslate + (Math.abs(deltaX) - maxTranslate) * 0.3);
        }
        
        setTranslateX(limitedDeltaX);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        
        setIsDragging(false);
        
        const distance = touchStartX - touchEndX;
        const minSwipeDistance = 50; // 最小滑动距离
        
        // 重置位移
        setTranslateX(0);
        
        if (Math.abs(distance) < minSwipeDistance) {
            // 滑动距离不够，重置状态
            setTouchStartX(0);
            setTouchEndX(0);
            return;
        }
        
        if (distance > 0) {
            // 向左滑动，切换到下一张
            handleNextCard();
        } else {
            // 向右滑动，切换到上一张
            handlePrevCard();
        }
        
        // 重置触摸状态
        setTouchStartX(0);
        setTouchEndX(0);
    };

    const currentMembership = memberships[currentIndex];
    
    // 检查会员卡是否有效
    const isValidMembership = (membership: MembershipResponse) => {
        return membership.remaining_sessions > 0 && new Date(membership.expired_at) > new Date();
    };

    return (
        <View className={styles.container}>
            <View 
                className={styles.card_wrapper}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: `translateX(${translateX}px) ${isDragging && Math.abs(translateX) > 20 ? 'scale(0.95)' : 'scale(1)'}`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    filter: isDragging && Math.abs(translateX) > 20 ? 'brightness(0.9)' : 'brightness(1)'
                }}
            >
                <VipCard
                  key={`${currentMembership.id}-${currentIndex}`}
                  cardName={getCardTypeName(currentMembership.type_id as CardType)}
                  remainingDays={currentMembership.remaining_sessions}
                  expireDate={localizeDate(currentMembership.expired_at)}
                />
                
                {/* 页码指示器覆盖在卡片右下角 */}
                <View className={styles.card_counter_overlay}>
                    <Text className={styles.card_counter_text}>
                        {currentIndex + 1}/{memberships.length}
                    </Text>
                </View>
                
                {/* 无效状态遮罩 */}
                {!isValidMembership(currentMembership) && (
                    <View className={styles.invalid_overlay}>
                        <Text className={styles.invalid_text}>
                            {currentMembership.remaining_sessions <= 0 ? '次数已用完' : '已过期'}
                        </Text>
                    </View>
                )}
            </View>

            {/* 指示器 - 仅显示当前位置，保留点击功能作为辅助 */}
            <View className={styles.indicators_container}>
                <View className={styles.indicators}>
                    {memberships.map((_, index) => (
                        <View 
                          key={index}
                          className={`${styles.indicator} ${currentIndex === index ? styles.active : ''}`}
                          onClick={() => {
                                setCurrentIndex(index);
                                if (onCardSelect) {
                                    onCardSelect(memberships[index]);
                                }
                            }}
                        />
                    ))}
                </View>
                <Text className={styles.swipe_hint}>左右滑动切换会员卡</Text>
            </View>

        </View>
    );
};

export default MembershipCardsDisplay;