import { View } from '@tarojs/components';
import React, { useState } from 'react';
import CardSwiper from '../../modules/appointment/card-swiper';
import styles from './index.module.less';
import DateSelectorDrawer, { DateItem } from '../../modules/appointment/date-selector-drawer';
import { TimeSlot } from '@/utils';

const Appointment: React.FC = () => {
    const [selectedCoach, setSelectedCoach] = useState<string>('');
    const [dateSelectorVisible, setDateSelectorVisible] = useState<boolean>(false);

    // 示例卡片数据
    const cards = [
        { id: 1, title: '卡片 1', content: '内容 1' },
        { id: 2, title: '卡片 2', content: '内容 2' },
        { id: 3, title: '卡片 3', content: '内容 3' },
        { id: 4, title: '卡片 4', content: '内容 4' },
    ];

    const handleCardChange = (index: number) => {
        console.log('当前卡片索引:', index);
    };

    const handleConfirmCoach = () => {
        console.log('确定');
        setDateSelectorVisible(true);
    };

    const handleConfirmDate = (date: DateItem, timeSlot: TimeSlot) => {
        console.log('确定', date, timeSlot);
    };

    return (
        <View className={styles.wrapper}>
            <CardSwiper cards={cards} onCardChange={handleCardChange} onConfirm={handleConfirmCoach} />
            <DateSelectorDrawer visible={dateSelectorVisible} onClose={() => setDateSelectorVisible(false)} onConfirm={handleConfirmDate} />
        </View>
    );
};

export default Appointment; 