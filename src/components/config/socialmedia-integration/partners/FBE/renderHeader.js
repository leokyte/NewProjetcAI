import React from 'react';
import { Image, View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import I18n from '../../../../../i18n/i18n';

import { FbeHeader, FbeHeaderIntegrated, SocialNetworks } from '../../../../../../assets/images';

import { colors } from '../../../../../styles';

const Strings = {
  LANG: I18n.t('fbIntegration.imageCode'),

  CONNECTED_MENU_TITLE: I18n.t('fbe.connectedMenuTitle'),

  TITLE_ACCEPT_ORDERS_1: I18n.t('fbe.acceptOrderTitle.text1'),
  TITLE_ACCEPT_ORDERS_2: I18n.t('fbe.acceptOrderTitle.text2'),
  TITLE_ACCEPT_ORDERS_3: I18n.t('fbe.acceptOrderTitle.text3'),

  SUBTITLE_ACCEPT_ORDERS_1: I18n.t('fbe.acceptOrderText.text1'),
  SUBTITLE_ACCEPT_ORDERS_2: I18n.t('fbe.acceptOrderText.text2'),
  SUBTITLE_ACCEPT_ORDERS_3: I18n.t('fbe.acceptOrderText.text3'),
};

const renderHeader = (isFbeIntegrated) => {
  return (
    <View
      style={[
        styles.containerHeader,
        {
          backgroundColor: isFbeIntegrated ? colors.actionColor : colors.primaryDarker,
        },
      ]}
    >
      {isFbeIntegrated ? (
        <KyteText
          size={19.8}
          color={colors.white}
          textAlign="center"
          marginBottom={24}
          lineHeight={29}
          style={styles.title}
          weight={500}
        >
          {Strings.CONNECTED_MENU_TITLE}
        </KyteText>
      ) : (
        <KyteText
          size={19.8}
          color={colors.white}
          textAlign="center"
          marginBottom={24}
          lineHeight={29}
          marginLeft={25}
          marginRight={25}
        >
          {Strings.TITLE_ACCEPT_ORDERS_1}{' '}
          <KyteText weight={600} color={colors.white} size={19.8}>
            {Strings.TITLE_ACCEPT_ORDERS_2}
          </KyteText>{' '}
          {Strings.TITLE_ACCEPT_ORDERS_3}
        </KyteText>
      )}

      {isFbeIntegrated ? (
        <Image source={{ uri: SocialNetworks }} style={styles.socialNetworks} />
      ) : null}

      <Image
        source={{
          uri: isFbeIntegrated ? FbeHeaderIntegrated(Strings.LANG) : FbeHeader(Strings.LANG),
        }}
        style={styles.imgHeader}
      />

      {!isFbeIntegrated ? (
        <KyteText size={18} color={colors.white} textAlign="center" marginTop={10} lineHeight={25}>
          {Strings.SUBTITLE_ACCEPT_ORDERS_1}{' '}
          <KyteText weight={600} color={colors.white} size={18}>
            {Strings.SUBTITLE_ACCEPT_ORDERS_2}
            {'\n'}
          </KyteText>
          {Strings.SUBTITLE_ACCEPT_ORDERS_3}
        </KyteText>
      ) : null}
    </View>
  );
};

const styles = {
  containerHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imgHeader: {
    width: 320,
    height: 180,
  },
  socialNetworks: {
    width: 193,
    height: 50,
    marginBottom: 22,
    marginTop: 7,
  },
  title: {
    width: '50%',
  },
};

export default renderHeader;
