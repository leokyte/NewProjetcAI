import React from 'react';
import { View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import { KyteIcon } from './';
import { colors } from '../../styles';

export const WarningAlert = ({ children, title, ...props }) => {
  return (
    <View style={styles.containerAlert} {...props}>
      <KyteIcon name={'warning'} color={colors.warningColor} />

      <View style={styles.contentAlert}>
        <KyteText
          weight={600}
          color={colors.primaryBlack}
          size={16.2}
          lineHeight={24.3}
          marginBottom={4}
        >
          {title}
        </KyteText>

        <KyteText color={colors.primaryDarker} size={14.4} lineHeight={21} marginRight={35}>
          {children}
        </KyteText>
      </View>
    </View>
  );
};

const styles = {
  containerAlert: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '95%',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 90,
    alignItems: 'center',
    backgroundColor: '#F5A62314',
    borderColor: colors.warningColor,
  },
  contentAlert: {
    marginLeft: 22,
  },
};
