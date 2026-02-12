import React from 'react';
import { View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import I18n from '../../../../../../i18n/i18n';
import { colors } from '../../../../../../styles';
import { ActionButton } from '../../../../../common';

export const ContentIntro = ({ setContentModal, setIsModalVisible, uninstall }) => {
  const Strings = {
    TITLE_CONTENT_INTRO_CONNECTED: I18n.t('tiktok.contentIntroIntegratedTitle'),
    SUBTITLE_CONTENT_INTRO_CONNECTED: I18n.t('tiktok.contentIntroIntegratedSubtitle'),

    LABEL_UNINSTALL: I18n.t('uninstallIntegrationLabel'),
    TITLE_UNINSTALL_INTEGRATION_BUTTON: I18n.t('tiktok.uninstallIntegrationButtonLabel'),
    TEXT_UNINSTALL_INTEGRATION_BUTTON: I18n.t('tiktok.uninstallIntegrationText'),
  };

  return (
    <View style={styles.containerButton}>
      <KyteText
        weight={600}
        size={18}
        color={colors.primaryDarker}
        textAlign="center"
        marginBottom={8}
      >
        {`${Strings.TITLE_CONTENT_INTRO_CONNECTED} 🎉`}
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
        {Strings.SUBTITLE_CONTENT_INTRO_CONNECTED}
      </KyteText>

      <View>
        <ActionButton
          onPress={() => {
            setContentModal({
              labelButton: Strings.LABEL_UNINSTALL,
              actionButton: () => uninstall(),
              title: Strings.TITLE_UNINSTALL_INTEGRATION_BUTTON,
              description: Strings.TEXT_UNINSTALL_INTEGRATION_BUTTON,
              colorButton: colors.barcodeRed,
            });
            setIsModalVisible(true);
          }}
          color={colors.barcodeRed}
        >
          {Strings.TITLE_UNINSTALL_INTEGRATION_BUTTON}
        </ActionButton>
      </View>
    </View>
  );
};

const styles = {
  containerButton: {
    paddingTop: 31,
    paddingBottom: 36,
  },
};
