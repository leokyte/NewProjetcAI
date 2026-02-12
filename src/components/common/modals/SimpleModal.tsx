import React from 'react';
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container';
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText';
import { KyteButton, KyteIcon } from '../../../components/common';
import { colors } from '../../../styles';
import I18n from '../../../i18n/i18n';
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin';
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding';
import { Modal, TouchableOpacity } from 'react-native';
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row';
import { View } from 'react-native-animatable';

interface SimpleModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  confirmButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SimpleModal = ({
  visible,
  title,
  subtitle,
  confirmButtonText,
  onConfirm,
  onCancel,
}: SimpleModalProps) => {
  return (
    <Modal
      visible={visible} 
      onTouchCancel={onCancel}
      onRequestClose={onCancel}
      animationType='fade'
      transparent
      style={{ borderRadius: 16, }}
    >
       <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(21, 24, 30, 0.48)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container 
          backgroundColor={colors.white}
          width='85%'
          height='auto'
          minHeight={250}
          borderRadius={16}
        >
          {/* header */}
          <Container paddingTop={8} paddingBottom={8} paddingLeft={16} paddingRight={16} height={64}>
            <Padding top={16}>
              <Row alignItems='center' justifyContent='space-between' style={{ width: "100%" }}>
                {title ? (
                    <KyteText size={14} weight={500}>
                      {title}
                    </KyteText>
                ) : <Container />}

                <TouchableOpacity onPress={onCancel}>
                  <KyteIcon name="close-navigation" size={16} />
                </TouchableOpacity>
              </Row>
            </Padding>
          </Container>
          
          {/* body */}
          {subtitle && (
            <Padding horizontal={16}>
              <KyteText
                size={14}
                color={colors.primaryBlack}
                style={{ lineHeight: 20 }}
                textAlign='center'
              >
                {subtitle}
              </KyteText>
            </Padding>
          )}   

          {/* footer */}
          <Padding all={16}>
            <KyteButton 
              height={48} 
              type="primary"
              background={colors.redLighter} 
              onPress={onConfirm}
            >
              <KyteText size={16} weight={500} color={colors.white}>
                {confirmButtonText}
              </KyteText>
            </KyteButton>

            <Margin top={16} />

            <KyteButton
              height={48}
              background={colors.grayLighter}
              onPress={onCancel}
            >
              <KyteText size={16} weight={500} color={colors.primaryBlack}>
                {I18n.t('alertDismiss')}
              </KyteText>
            </KyteButton>
          </Padding >
        </Container>
      </View>
    </Modal>
  );
};
