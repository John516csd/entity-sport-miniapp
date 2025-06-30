import { View, Button, Image } from '@tarojs/components';
import { CSSProperties, useRef, useState } from 'react';
import styles from './index.module.less';

export interface CardItem {
    id: number | string;
    title: string;
    content: string;
    avatar: string;
}

interface CardSwiperProps {
    cards: CardItem[];
    onCardChange?: (index: number) => void;
    onConfirm?: (value: CardItem) => void;
}

const CardSwiper = ({ cards, onCardChange, onConfirm }: CardSwiperProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [startX, setStartX] = useState(0);
    const [moveX, setMoveX] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const threshold = 50;
    const cardsWrapperRef = useRef<HTMLDivElement>(null);

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
            onCardChange?.(newActiveIndex);
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
        onConfirm?.(cards[activeIndex]);
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
                                ${index < activeIndex ? styles.left : ''}`} key={card.id}
                            >
                                <View className={styles.card_avatar}>
                                    <Image src={card.avatar} />
                                </View>
                                <View className={styles.card_title}>{card.title}</View>
                                <View className={styles.card_content}>{card.content}</View>
                            </View>
                        </View>
                    ))}
                </View>
                <View className={styles.confirm_btn_wrapper}>
                    <Button className={styles.confirm_btn} onClick={handleConfirm}>
                        <View className={styles.confirm_btn_text}>确定</View>
                    </Button>
                </View>
            </View>
        </View>
    );
};

export default CardSwiper; 