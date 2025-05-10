import { View } from '@tarojs/components';
import React, { CSSProperties, useRef, useState } from 'react';
import styles from './index.module.less';

const Appointment: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [startX, setStartX] = useState(0);
    const [moveX, setMoveX] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const threshold = 50;
    const cardsWrapperRef = useRef<HTMLDivElement>(null);

    // 示例卡片数据
    const cards = [
        { id: 1, title: '卡片 1', content: '内容 1' },
        { id: 2, title: '卡片 2', content: '内容 2' },
        { id: 3, title: '卡片 3', content: '内容 3' },
        { id: 4, title: '卡片 4', content: '内容 4' },
    ];

    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
        setIsMoving(true);
    };

    const handleTouchMove = (e) => {
        if (!isMoving) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        if (cardsWrapperRef.current) {
            cardsWrapperRef.current.style.transition = 'none';
        }
        setMoveX(diff);
    };

    const handleTouchEnd = (e) => {
        if (!isMoving) return;
        setIsMoving(false);
        if (Math.abs(moveX) > threshold) {
            const newActiveIndex = Math.min(Math.max(0, activeIndex + (moveX > 0 ? -1 : 1)), cards.length - 1);
            setActiveIndex(newActiveIndex);
        }
        if (cardsWrapperRef.current) {
            cardsWrapperRef.current.style.transition = 'all linear 0.3s';
        }
        setMoveX(0);
    };

    // 计算旋转角度，范围在0-10之间
    const calculateRotateRate = (moveX: number) => {
        const absMoveX = Math.abs(moveX);
        // 将moveX映射到0-10的范围，当moveX为threshold时达到最大值10
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
                    {cards.map((card, index) => (
                        <View className={`${styles.card_item_wrapper}`} key={card.id}>
                            <View className={`${styles.card} ${activeIndex === index ? styles.active : ''} 
                                ${index > activeIndex ? styles.right : ''} 
                                ${index < activeIndex ? styles.left : ''}`} key={card.id}>
                                <View className={styles.card_title}>{card.title}</View>
                                <View className={styles.card_content}>{card.content}</View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default Appointment; 