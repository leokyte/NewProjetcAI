import React from 'react';
import { ScrollView } from 'react-native';
import { KyteBox, KyteText } from '@kyteapp/kyte-ui-components';

import { KyteModal } from '../../../../common';
import I18n from '../../../../../i18n/i18n';
import { colors } from '../../../../../styles';
import { listFeatures } from './';

const ModalTip = ({ isVisible, closeModal }) => {
  return (
    <KyteModal
      topRadius={14}
      bottomPage
      height="auto"
      isModalVisible={isVisible}
      hideModal={closeModal}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <KyteBox ph={5} pv={4}>
          <KyteBox align="center" mb={4}>
            <KyteText
              textAlign="center"
              color={colors.primaryDarker}
              size={14}
              weight={500}
              marginBottom={4}
            >
              {I18n.t('catalog.banner.mainTitle')}
            </KyteText>
            <KyteText textAlign="center" color={colors.primaryDarker} size={12}>
              {I18n.t('catalog.banner.mainDescription')}
            </KyteText>
          </KyteBox>

          {listFeatures.map((item, index) => (
            <KyteBox bg={colors.borderlight} ph={4} pv={2} borderRadius={6} mt={4} key={index}>
              <KyteText color={colors.secondaryBg} size={12} weight={500}>
                {item.title}
              </KyteText>
              {item.description}
            </KyteBox>
          ))}
        </KyteBox>
      </ScrollView>
    </KyteModal>
  );
};

export { ModalTip };
