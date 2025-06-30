import { View, Button, Text } from '@tarojs/components';
import { CSSProperties, useRef, useState, useEffect } from 'react';
import { MembershipResponse } from '@/api/types';
import { localizeDate } from '@/utils/date';
import { CardType, getCardTypeName } from '@/types';
import VipCard from '../vip-card';
import styles from './index.module.less';

interface MembershipCardSelectorProps {
    memberships: MembershipResponse[];
    selectedMembership?: MembershipResponse | null;
    onCardChange?: (membership: MembershipResponse) => void;
    onConfirm?: (membership: MembershipResponse) => void;
    showConfirmButton?: boolean;
}

const MembershipCardSelector = ({ 
    memberships, 
    selectedMembership, 
    onCardChange, 
    onConfirm,
    showConfirmButton = true 
}: MembershipCardSelectorProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [startX, setStartX] = useState(0);
    const [moveX, setMoveX] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const threshold = 50;
    const cardsWrapperRef = useRef<HTMLDivElement>(null);

    // 初始化选中的卡片索引
    useEffect(() => {
        if (selectedMembership && memberships.length > 0) {
            const index = memberships.findIndex(m => m.id === selectedMembership.id);
            if (index !== -1) {
                setActiveIndex(index);
            }
        }
    }, [selectedMembership, memberships]);

    const handleTouchStart = (e) => {
        if (memberships.length <= 1) return;
        setStartX(e.touches[0].clientX);
        setIsMoving(true);
    };

    const handleTouchMove = (e) => {
        if (!isMoving || memberships.length <= 1) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        if (cardsWrapperRef.current) {
            cardsWrapperRef.current.style.transition = 'none';
        }
        setMoveX(diff);
    };

    const handleTouchEnd = (e) => {
        if (!isMoving || memberships.length <= 1) return;
        setIsMoving(false);
        if (Math.abs(moveX) > threshold) {
            const newActiveIndex = Math.min(Math.max(0, activeIndex + (moveX > 0 ? -1 : 1)), memberships.length - 1);
            setActiveIndex(newActiveIndex);
            onCardChange?.(memberships[newActiveIndex]);
        }
        if (cardsWrapperRef.current) {
            cardsWrapperRef.current.style.transition = 'all linear 0.3s';
        }
        setMoveX(0);
    };

    // 计算旋转角度，范围在0-10之间
    const calculateRotateRate = (moveX: number) => {
        const absMoveX = Math.abs(moveX);
        return Math.min(Math.max(0, (absMoveX / threshold) * 10), 10);
    };

    // 计算translateY，范围在0-60之间
    const calculateTranslateYRate = (moveX: number) => {
        const absMoveX = Math.abs(moveX);
        return Math.min(Math.max(0, (absMoveX / threshold) * 60), 60);
    };

    // 计算scale，范围在0.9-1之间
    const calculateScaleRate = (moveX: number) => {
        const absMoveX = Math.abs(moveX);
        return Math.min(Math.max(0, (absMoveX / threshold)), 1);
    };

    const handleConfirm = () => {
        if (memberships[activeIndex]) {
            onConfirm?.(memberships[activeIndex]);
        }
    };

    // 检查会员卡是否有效
    const isValidMembership = (membership: MembershipResponse) => {
        return membership.remaining_sessions > 0 && new Date(membership.expired_at) > new Date();
    };

    if (memberships.length === 0) {
        return (
            <View className={styles.wrapper}>
                <View className={styles.empty_state}>
                    <Text className={styles.empty_text}>暂无可用会员卡</Text>
                </View>
            </View>
        );
    }

    return (
        <View className={styles.wrapper}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
            <View className={styles.cards_container}>
                <View className={styles.cards_wrapper} ref={cardsWrapperRef}
                  style={{
                        '--active-index': activeIndex,
                        '--move-x': moveX,
                        '--rotate-rate': calculateRotateRate(moveX),
                        '--translate-y-rate': calculateTranslateYRate(moveX),
                        '--move-distance': moveX > 0 ? 1 : -1,
                        '--scale-rate': calculateScaleRate(moveX)
                    } as CSSProperties}
                >
                    {memberships.map((membership, index) => (
                        <View className={styles.card_item_wrapper} key={membership.id}>
                            <View className={`${styles.card} ${activeIndex === index ? styles.active : ''}
                                ${index > activeIndex ? styles.right : ''}
                                ${index < activeIndex ? styles.left : ''}
                                ${!isValidMembership(membership) ? styles.invalid : ''}`}
                            >
                                {/* 使用统一的 VipCard 组件 */}
                                <View className={styles.vip_card_wrapper}>
                                    <VipCard
                                        key={membership.id}
                                        cardName={getCardTypeName(membership.type_id as CardType)}
                                        remainingDays={membership.remaining_sessions}
                                        expireDate={localizeDate(membership.expired_at)}
                                    />
                                    {/* 无效状态遮罩 */}
                                    {!isValidMembership(membership) && (
                                        <View className={styles.invalid_overlay}>
                                            <Text className={styles.invalid_text}>
                                                {membership.remaining_sessions <= 0 ? '次数已用完' : '已过期'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
                
                {/* 多张卡片时显示指示器 */}
                {memberships.length > 1 && (
                    <View className={styles.indicators}>
                        {memberships.map((_, index) => (
                            <View 
                              key={index}
                              className={`${styles.indicator} ${activeIndex === index ? styles.active : ''}`}
                            />
                        ))}
                    </View>
                )}
                
                {showConfirmButton && (
                    <View className={styles.confirm_btn_wrapper}>
                        <Button 
                          className={`${styles.confirm_btn} ${
                                !isValidMembership(memberships[activeIndex]) ? styles.disabled : ''
                            }`}
                          onClick={handleConfirm}
                          disabled={!isValidMembership(memberships[activeIndex])}
                        >
                            <View className={styles.confirm_btn_text}>确定</View>
                        </Button>
                    </View>
                )}
            </View>
        </View>
    );
};

export default MembershipCardSelector;