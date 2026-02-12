import React from 'react';
import { View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import I18n from '../../../../../i18n/i18n';

import { KyteIcon } from '../../../../common';

import { colors } from '../../../../../styles';

const Strings = {
  TITLE_ALERT: I18n.t('fbe.alertTitle'),
  TEXT_ALERT_1: I18n.t('fbe.alertText1'),
  TEXT_ALERT_2: I18n.t('fbe.alertText2'),
  TEXT_ALERT_3: I18n.t('fbe.alertText3'),
};

const renderAlert = () => {
  return (
    <View style={styles.containerAlert}>
      <KyteIcon name={'warning'} color={colors.warningColor} />

      <View style={styles.contentAlert}>
        <KyteText
          weight={600}
          color={colors.primaryBlack}
          size={16.2}
          lineHeight={24.3}
          marginBottom={4}
        >
          {Strings.TITLE_ALERT}
        </KyteText>

        <KyteText color={colors.primaryDarker} size={14.4} lineHeight={21} marginRight={35}>
          {Strings.TEXT_ALERT_1}{' '}
          <KyteText weight={600} size={14}>
            {Strings.TEXT_ALERT_2}
          </KyteText>{' '}
          {Strings.TEXT_ALERT_3}
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

export default renderAlert;
