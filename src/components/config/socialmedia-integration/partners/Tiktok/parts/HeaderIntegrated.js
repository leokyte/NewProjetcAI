import React from 'react';
import { Image, View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import I18n from './../../../../../../i18n/i18n';
import { SocialNetworksTiktok, TikTokHeaderIntegrated } from './../../../../../../../assets/images';
import { colors } from './../../../../../../styles';

export const HeaderIntegrated = () => {
  const Strings = {
    CONNECTED_MENU_TITLE: I18n.t('tiktok.connectedMenuTitle'),
  };

  return (
    <View
      style={[
        styles.containerHeader,
        {
          backgroundColor: colors.actionColor,
        },
      ]}
    >
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

      <Image source={{ uri: SocialNetworksTiktok }} style={styles.socialNetworksTiktok} />

      <Image
        source={{ uri: TikTokHeaderIntegrated(I18n.t('fbIntegration.imageCode')) }}
        style={styles.imgHeaderTikTok}
      />
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
    height: 300,
  },
  socialNetworksTiktok: {
    width: 120,
    height: 47,
    marginBottom: 22,
    marginTop: 7,
  },
  title: {
    width: '50%',
  },
};
