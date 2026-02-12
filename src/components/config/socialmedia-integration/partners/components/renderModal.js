import React from 'react';
import { View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import I18n from '../../../../../i18n/i18n';

import { colors } from '../../../../../styles';

const Strings = {
  LABEL_UNINSTALL_SUCCESS: I18n.t('alertOk'),
  TEXT_OK: I18n.t('words.s.ok'),
  LABEL_INTEGRATION_FAILURE: I18n.t('failureIntegrationLabel'),
  LABEL_INTEGRATION_UNINSTALL: I18n.t('uninstallIntegrationLabel'),
  LABEL_INTEGRATION_CANCEL: I18n.t('alertDismiss'),
};

const renderOptionsModal = (
  typeEvent,
  setIsModalVisible,
  navigate,
  uninstallIntegration,
  handleIntegrationFacebookPixel,
) => {
  const renderModalOffline = (request) => {
    return (
      <View style={styles.buttonsModal}>
        <KyteText color={colors.primaryBlack} size={14} onPress={() => setIsModalVisible(false)}>
          {Strings.LABEL_INTEGRATION_CANCEL}
        </KyteText>

        <KyteText color={colors.primaryBlack} size={14} weight={600} onPress={request}>
          {Strings.LABEL_INTEGRATION_FAILURE}
        </KyteText>
      </View>
    );
  };

  switch (typeEvent) {
    case 'uninstallSuccess':
      return (
        <KyteText
          color={colors.primaryBlack}
          size={14}
          weight={600}
          textAlign="center"
          marginTop={28}
          onPress={() => {
            setIsModalVisible(false);
            navigate('SocialMediaIntegration');
          }}
        >
          {Strings.LABEL_UNINSTALL_SUCCESS}
        </KyteText>
      );
    case 'uninstallError':
      return (
        <KyteText
          color={colors.primaryBlack}
          size={14}
          weight={600}
          textAlign="center"
          marginTop={28}
          onPress={() => {
            setIsModalVisible(false);
          }}
        >
          {Strings.TEXT_OK}
        </KyteText>
      );
    case 'integrationError':
      return (
        <View style={styles.buttonsModal}>
          <KyteText color={colors.primaryBlack} size={14} onPress={() => setIsModalVisible(false)}>
            {Strings.LABEL_INTEGRATION_CANCEL}
          </KyteText>

          <KyteText
            color={colors.primaryBlack}
            size={14}
            weight={600}
            onPress={handleIntegrationFacebookPixel}
          >
            {Strings.LABEL_INTEGRATION_FAILURE}
          </KyteText>
        </View>
      );
    case 'pixelIdAlteredSuccess':
      return (
        <KyteText
          color={colors.primaryBlack}
          size={14}
          weight={600}
          textAlign="center"
          marginTop={28}
          onPress={() => {
            setIsModalVisible(false);
          }}
        >
          {Strings.TEXT_OK}
        </KyteText>
      );
    case 'pixelIdAlteredError':
      return (
        <KyteText
          color={colors.primaryBlack}
          size={14}
          weight={600}
          textAlign="center"
          marginTop={28}
          onPress={() => {
            setIsModalVisible(false);
          }}
        >
          {Strings.TEXT_OK}
        </KyteText>
      );
    case 'offlineEditError':
      return renderModalOffline(handleIntegrationFacebookPixel);
    case 'offlineUninstallError':
      return renderModalOffline(uninstallIntegration);
    default:
      return (
        <View style={styles.buttonsModal}>
          <KyteText
            color={colors.primaryBlack}
            size={14}
            weight={600}
            onPress={() => setIsModalVisible(false)}
          >
            {Strings.LABEL_INTEGRATION_CANCEL}
          </KyteText>

          <KyteText color={colors.primaryBlack} size={14} onPress={uninstallIntegration}>
            {Strings.LABEL_INTEGRATION_UNINSTALL}
          </KyteText>
        </View>
      );
  }
};

const renderModal = (
  title,
  description,
  typeEvent,
  setIsModalVisible,
  navigate,
  uninstallIntegration,
  handleIntegrationFacebookPixel,
) => {
  return (
    <View style={styles.containerModal}>
      <KyteText
        size={16}
        color={colors.primaryBlack}
        textAlign="center"
        marginBottom={12}
        weight={500}
      >
        {title}
      </KyteText>

      <KyteText size={14} color={colors.primaryBlack} textAlign="center" lineHeight={21}>
        {description}
      </KyteText>

      {renderOptionsModal(
        typeEvent,
        setIsModalVisible,
        navigate,
        uninstallIntegration,
        handleIntegrationFacebookPixel,
      )}
    </View>
  );
};

const styles = {
  containerModal: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  buttonsModal: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
};

export default renderModal;
