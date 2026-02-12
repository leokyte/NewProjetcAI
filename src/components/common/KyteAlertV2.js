import React from 'react';
import { View } from 'react-native';
import { KyteButtonV2 } from '@kyteapp/kyte-ui-components';

import { KyteModal, KyteText } from './';
import I18n from '../../i18n/i18n';
import { generateTestID } from '../../util';

export const KyteAlertV2 = ({ hideModal, isModalVisible, contentModal }) => {
  const {
    children,
    title,
    description,
    actionButton,
    labelButton,
    oneButton = false,
    titleHeader,
  } = contentModal;

  return (
    <KyteModal
      isModalVisible={isModalVisible}
      hideModal={hideModal}
      height="auto"
      title={titleHeader}
    >
      <View style={styles.container}>
        {title && (
          <KyteText marginBottom={20} weight="Medium" size={17}>
            {title}
          </KyteText>
        )}

        {description && !children ? (
          <KyteText size={15} style={styles.text}>
            {description}
          </KyteText>
        ) : description && children ? (
          <>
            <KyteText size={15} style={styles.text}>
              {description}
            </KyteText>
            {children}
          </>
        ) : (
          children
        )}

        <View style={styles.buttons} {...generateTestID('button-kalert')}>
          {!oneButton && (
            <View style={[styles.flex, { paddingRight: 8 }]}>
              <KyteButtonV2 size="sm" type="cancel" onPress={() => hideModal()}>
                {I18n.t('alertDismiss')}
              </KyteButtonV2>
            </View>
          )}
          <View style={[styles.flex, { paddingLeft: 8 }]}>
            <KyteButtonV2 size="sm" onPress={() => (actionButton ? actionButton() : hideModal())}>
              {labelButton || I18n.t('alertOk')}
            </KyteButtonV2>
          </View>
        </View>
      </View>
    </KyteModal>
  );
};

const styles = {
  container: {
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    paddingTop: 20,
  },
  text: {
    textAlign: 'center',
    lineHeight: 20,
  },
  flex: {
    flex: 1,
  },
};
