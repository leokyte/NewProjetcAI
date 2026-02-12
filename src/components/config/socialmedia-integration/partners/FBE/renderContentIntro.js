import React from 'react';
import { View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import I18n from '../../../../../i18n/i18n';

import { ActionButton } from '../../../../common';

import showModal from '../../utils/showModal';

import { colors } from '../../../../../styles';

const Strings = {
  TITLE_CONTENT_INTRO: I18n.t('fbe.contentIntroTitle'),
  SUBTITLE_CONTENT_INTRO: I18n.t('fbe.contentIntroSubtitle'),
  TITLE_CONTENT_INTRO_CONNECTED: I18n.t('fbe.contentIntroIntegratedTitle'),
  SUBTITLE_CONTENT_INTRO_CONNECTED: I18n.t('fbe.contentIntroIntegratedSubtitle'),

  TEXT_CONTENT_INTRO_CONNECTED: I18n.t('fbe.contentIntroIntegratedText'),

  TITLE_UNINSTALL_INTEGRATION_BUTTON: I18n.t('uninstallIntegrationButtonLabel'),
  TEXT_UNINSTALL_INTEGRATION_BUTTON: I18n.t('uninstallIntegrationText'),
};

const renderContentIntro = (isFbeIntegrated, setContentModal, setIsModalVisible) => {
  return (
    <View style={styles.containerContentIntro}>
      <KyteText
        weight={600}
        size={18}
        color={colors.primaryDarker}
        textAlign="center"
        marginBottom={8}
      >
        {isFbeIntegrated
          ? `${Strings.TITLE_CONTENT_INTRO_CONNECTED} 🎉`
          : Strings.TITLE_CONTENT_INTRO}
      </KyteText>

      <KyteText
        size={16.2}
        color={colors.primaryDarker}
        textAlign="center"
        lineHeight={22}
        marginLeft={50}
        marginRight={50}
        marginBottom={10}
      >
        {isFbeIntegrated
          ? Strings.SUBTITLE_CONTENT_INTRO_CONNECTED
          : `${Strings.SUBTITLE_CONTENT_INTRO} 😎`}
      </KyteText>

      {isFbeIntegrated && (
        <View style={styles.containerFbeIntegration}>
          <ActionButton
            onPress={() =>
              showModal(
                Strings.TITLE_UNINSTALL_INTEGRATION_BUTTON,
                Strings.TEXT_UNINSTALL_INTEGRATION_BUTTON,
                '',
                setContentModal,
                setIsModalVisible,
              )
            }
            color={colors.barcodeRed}
            style={styles.buttonUninstall}
          >
            {Strings.TITLE_UNINSTALL_INTEGRATION_BUTTON}
          </ActionButton>

          <KyteText
            size={18}
            weight={500}
            color={colors.primaryDarker}
            textAlign="center"
            lineHeight={25}
            marginLeft={30}
            marginRight={30}
            marginBottom={5}
          >
            {Strings.TEXT_CONTENT_INTRO_CONNECTED}
          </KyteText>
        </View>
      )}
    </View>
  );
};

const styles = {
  containerContentIntro: {
    alignSelf: 'center',
    marginTop: 31,
    marginBottom: 36,
  },

  buttonUninstall: {
    marginBottom: 44,
    marginTop: 13,
  },
};

export default renderContentIntro;
