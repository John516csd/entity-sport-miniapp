import { View, Text } from '@tarojs/components';
import React from 'react';
import { colors } from '../../styles/colors';

const Appointment: React.FC = () => {
    return (
        <View style={{ backgroundColor: colors.background }}>
            <Text style={{ color: colors.primary }}>预约 Test</Text>
        </View>
    );
};

export default Appointment; 