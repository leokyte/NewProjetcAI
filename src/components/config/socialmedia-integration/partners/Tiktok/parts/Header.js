import React from 'react';
import { Image, View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import I18n from './../../../../../../i18n/i18n';
import { TikTokHeader } from './../../../../../../../assets/images';
import { colors } from './../../../../../../styles';

export const Header = () => {
  const Strings = {
    TITLE_ACCEPT_ORDERS_1: I18n.t('tiktok.acceptOrderTitle.text1'),
    TITLE_ACCEPT_ORDERS_2: I18n.t('tiktok.acceptOrderTitle.text2'),
    TITLE_ACCEPT_ORDERS_3: I18n.t('tiktok.acceptOrderTitle.text3'),

    SUBTITLE_ACCEPT_ORDERS_1: I18n.t('tiktok.acceptOrderText.text1'),
    SUBTITLE_ACCEPT_ORDERS_2: I18n.t('tiktok.acceptOrderText.text2'),
    SUBTITLE_ACCEPT_ORDERS_3: I18n.t('tiktok.acceptOrderText.text3'),
  };

  return (
    <View
      style={[
        styles.containerHeader,
        {
          backgroundColor: colors.primaryDarker,
        },
      ]}
    >
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
        {Strings.TITLE_ACCEPT_ORDERS_3} 🚀️
      </KyteText>

      <Image
        source={{ uri: TikTokHeader(I18n.t('fbIntegration.imageCode')) }}
        style={styles.imgHeaderTikTok}
      />

      <KyteText
        size={18}
        color={colors.white}
        textAlign="center"
        marginTop={10}
        lineHeight={25}
        marginLeft={24}
        marginRight={24}
      >
        {Strings.SUBTITLE_ACCEPT_ORDERS_1}{' '}
        <KyteText weight={600} color={colors.white} size={18}>
          {Strings.SUBTITLE_ACCEPT_ORDERS_2}
          {'\n'}
        </KyteText>
        {Strings.SUBTITLE_ACCEPT_ORDERS_3}
      </KyteText>
    </View>
  );
};

const styles = {
  containerHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imgHeaderTikTok: {
    width: 272,
    height: 314,
  },
};
