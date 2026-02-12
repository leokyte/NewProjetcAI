import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import ProgressCircle from 'react-native-progress-circle';
import { KyteText } from './';
import { colors } from '../../styles';

const UserProgress = ({
  size,
  label,
  percent,
  border = 2,
  contentColor,
  onPress,
  darkMode,
  activeOpacity,
  labelSize,
}) => (
  <TouchableOpacity onPress={() => onPress()}>
    <ProgressCircle
      percent={percent}
      radius={size}
      borderWidth={border}
      color={colors.actionColor}
      shadowColor={darkMode ? colors.primaryBg : colors.lighterColor}
      bgColor={"#fff"}
      activeOpacity={activeOpacity || 0.2}
    >
      <View style={styles.content(size, border, contentColor, darkMode)}>
        <KyteText
          style={styles.label}
          size={labelSize || 18}
          uppercase
          weight={'Semibold'}
          color={'white'}
        >
          {label}
        </KyteText>
      </View>
    </ProgressCircle>
  </TouchableOpacity>
);

const styles = {
  content: (size, border, backgroundColor, darkMode) => ({
    backgroundColor: backgroundColor || (darkMode ? colors.primaryBlack : colors.primaryColor),
    width: '100%',
    height: '100%',
    borderWidth: border,
    borderColor: darkMode ? colors.primaryDarker : 'white',
    borderRadius: size,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  label: {
    position: 'relative',
    top: Platform.OS === 'ios' ? 1 : -1,
  },
};

export { UserProgress };
