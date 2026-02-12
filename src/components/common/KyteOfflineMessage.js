import React from 'react';
import { View } from 'react-native';
import { KyteIcon } from '@kyteapp/kyte-ui-components';

import { KyteText } from './KyteText';
import { colors } from '../../styles';
import I18n from '../../i18n/i18n';

const Strings = {
  OFFLINE_SALES_MESSAGE: I18n.t('salesOfflineMessage'),
  OFFLINE_ORDERS_MESSAGE: I18n.t('ordersOfflineMessage'),
};

const KyteOfflineMessage = (props) => {
  return (
    <View style={styles.bottomContainer}>
      <KyteIcon size={14} name={'no-internet'} color="#FFFFFF" style={{ paddingRight: 5 }} />
      <KyteText color="#FFFFFF" size={12} weight="Medium">
        {props.isOrder ? Strings.OFFLINE_ORDERS_MESSAGE : Strings.OFFLINE_SALES_MESSAGE}
      </KyteText>
    </View>
  );
};

const styles = {
  bottomContainer: {
    backgroundColor: colors.barcodeRed,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export { KyteOfflineMessage };
