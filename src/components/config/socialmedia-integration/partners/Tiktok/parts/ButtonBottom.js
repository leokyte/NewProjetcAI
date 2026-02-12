import React from 'react';
import { View, Linking } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';
import * as RNLocalize from 'react-native-localize';

import I18n from '../../../../../../i18n/i18n';
import { kyteTiktokAdsCreation } from '../../../../../../services';
import { colors } from '../../../../../../styles';
import { ActionButton } from '../../../../../common';
import { logEvent } from '../../../../../../integrations';

export const ButtonBottom = ({ isIntegrated, navigation, toggleModalMoreInfo, aid }) => {
  const Strings = {
    TITLE_DOUBTS: I18n.t('tiktok.doubtsTitle'),
    DOUBTS_BUTTON_LABEL: I18n.t('tiktok.doubtsButtonLabel'),
    DOUBTS_TIKTOK_LABEL: I18n.t('tiktok.TiktokContentIntro.adsButton'),

    TUTORIAL_LINK: I18n.t('tiktok.tutorialLink'),

    TUTORIAL_BUTTON_LABEL: I18n.t('tiktok.goToCompleteTutorial'),
    INTEGRATION_BUTTON_LABEL: I18n.t('tiktok.integrationButtonLabel'),
  };

  const tiktokAdsCreation = async () => {
    try {
      const { data } = await kyteTiktokAdsCreation(aid, RNLocalize.getTimeZone());
      logEvent('TiktokAdCreate');
      Linking.openURL(data);
    } catch (ex) {
      console.log('error tiktokAdsCreation: ', ex);
    }
  };

  const buttonsTikTok = (
    <>
      <ActionButton
        cancel
        onPress={() => Linking.openURL(Strings.TUTORIAL_LINK)}
        style={styles.tutorialButton}
        text={Strings.TUTORIAL_BUTTON_LABEL}
        textStyle={styles.textButtonOutline}
      >
        {Strings.TUTORIAL_BUTTON_LABEL}
      </ActionButton>

      <ActionButton onPress={toggleModalMoreInfo}>{Strings.INTEGRATION_BUTTON_LABEL}</ActionButton>
    </>
  );

  const buttonsTikTokIntegrated = (
    <>
      <KyteText size={14} color={colors.secondaryGrey} textAlign="center" marginBottom={9}>
        {Strings.TITLE_DOUBTS}
      </KyteText>

      <ActionButton
        cancel
        onPress={() => navigation.navigate('Helpcenter')}
        style={styles.tutorialButton}
        text={Strings.CAHT_BUTTON_LABEL}
        textStyle={styles.textButtonOutline}
      >
        {Strings.DOUBTS_BUTTON_LABEL}
      </ActionButton>

      <ActionButton onPress={() => tiktokAdsCreation()}>{Strings.DOUBTS_TIKTOK_LABEL}</ActionButton>
    </>
  );

  return (
    <View style={styles.containerFooter}>
      {isIntegrated && buttonsTikTokIntegrated}
      {!isIntegrated && buttonsTikTok}
    </View>
  );
};

const styles = {
  containerFooter: {
    width: '100%',
    backgroundColor: colors.white,
    zIndex: 1,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.littleDarkGray,
  },
  tutorialButton: {
    marginBottom: 7,
  },
  textButtonOutline: {
    color: colors.secondaryGrey,
    fontSize: 14,
  },
  textButtonFacebook: {
    fontSize: 14,
  },
};
