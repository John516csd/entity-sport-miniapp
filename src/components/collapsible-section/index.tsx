import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.less';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    children,
    defaultExpanded = false,
    className
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <View className={`${styles.container} ${className || ''}`}>
            <Button className={styles.header} onClick={toggleExpanded}>
                <Text className={styles.title}>{title}</Text>
                <Text className={`${styles.arrow} ${isExpanded ? styles.expanded : ''}`}>
                    ▼
                </Text>
            </Button>
            <View className={`${styles.content} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                <View className={styles.content_inner}>
                    {children}
                </View>
            </View>
        </View>
    );
};

export default CollapsibleSection;