import React from 'react';
import { Modal, View } from 'react-native';
import { DetailPage, InputTextArea, ActionButton, CustomKeyboardAvoidingView, KyteText } from ".";
import I18n from '../../i18n/i18n';
import { colors } from '../../styles';

class TextAreaModal extends React.PureComponent {
  lengthLimit(maxLength, value) {
    const charQuantity = maxLength - value.length;
    return (
      <View style={styles.lengthContainer}>
        <KyteText size={16} pallete={charQuantity <= 0 ? 'errorColor' : 'tipColor'}>
          {I18n.t('storeReceiptModalFormLength').replace('$number', charQuantity)}
        </KyteText>
      </View>
    );
  }

  render() {
    const {
      modalTitle,
      closeModal,
      value,
      onChangeText,
      placeholder,
      ctaAction,
      visibiliy = true,
      animationType = 'slide',
      maxLength,
      inputFlex,
      rightButtons,
      children,
      tooltipContainer
    } = this.props;
    return (
      <Modal visible={visibiliy} animationType={animationType} backdropColor="#FFF">
        <DetailPage pageTitle={modalTitle} goBack={() => closeModal()} rightButtons={rightButtons}>
          <View style={styles.mainContainer}>
            <View style={styles.inputContainer(inputFlex)}>
              <InputTextArea
                value={value}
                style={styles.inputTextArea}
                onChangeText={(text) => onChangeText(text)}
                placeholder={placeholder}
                maxLength={maxLength}
                autoFocus
                multiline
                textAlignVertical="top"
                autoCorrect
                noBorder
                hideLabel
                flex
              />
              {tooltipContainer}
              <View style={styles.divider} />
              {maxLength ? this.lengthLimit(maxLength, value) : null}
            </View>
          </View>
          <CustomKeyboardAvoidingView>
            <View style={styles.bottomContainer}>
              <ActionButton onPress={() => ctaAction()}>
                {I18n.t('descriptionSaveButton')}
              </ActionButton>
            </View>
          </CustomKeyboardAvoidingView>
          {children}
        </DetailPage>
      </Modal>
    );
  }
}

const styles = {
  mainContainer: {
    flex: 1,
  },
  inputTextArea: {
    lineHeight: 26,
    flex: 1,
    paddingVertical: 15,
  },
  inputContainer: (flex = 1) => ({
    flex,
  }),
  divider: {
    borderBottomWidth: 1,
    borderColor: colors.littleDarkGray,
  },
  bottomContainer: {
    paddingVertical: 15,
  },
  lengthContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
};

export { TextAreaModal };
