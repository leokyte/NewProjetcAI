import React, { Component } from 'react';
import { View, ScrollView, Text, Dimensions, Linking } from 'react-native';

import {
  KyteModal,
  InputTextArea,
  CustomKeyboardAvoidingView,
  ActionButton,
} from '../../../common';
import I18n from '../../../../i18n/i18n';
import { colors, Type, colorSet } from '../../../../styles';
import { kyteCatalogDomain } from '../../../../util';
import { StoreHelpModal } from './StoreHelpModal';

class StoreFormModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value || '',
      charQtt: 160,
      isHelpModalVisible: false,
    };
  }

  buildRightIcon() {
    return [
      {
        icon: 'help-filled',
        color: colors.grayBlue,
        iconSize: 18,
        onPress: () => this.setState({ isHelpModalVisible: true }),
      },
    ];
  }

  renderHelpModal() {
    const { modalType, companyLogo } = this.state;
    const { navigate, formValues, storeAccount } = this.props;
    const { name, phone, headerExtra, footerExtra, customerExtra } = formValues;

    const navigateParams = {
      companyLogo,
      storeEditing: { name, phone, headerExtra, footerExtra, customerExtra },
      sale: {
        number: 1,
        status: 'closed',
        totalNet: 9.99,
        taxes: [],
        payments: [],
        items: [{ amount: '1', value: 9.99 }],
      },
    };

    const navigateAction = () => {
      if (modalType === 'catalog-extra') {
        Linking.openURL(`https://${this.props.storeAccount.urlFriendly}${kyteCatalogDomain}`);
        return;
      }
      navigate('ReceiptShareOptions', navigateParams);
    };

    return (
      <StoreHelpModal
        modalType={modalType}
        closeAction={() => this.setState({ isHelpModalVisible: false })}
        buttonAction={() => this.setState({ isHelpModalVisible: false })}
        navigateAction={() => navigateAction()}
      />
    );
  }

  onChangeText(v) {
    this.setState({ value: v });
  }

  render() {
    const { closeAction, modalInfo, buttonAction, rightIcon, onChangeText, trueValue, testID } = this.props;

    const { isHelpModalVisible } = this.state;
    const { avoidingContainer, fieldContainer, lengthContainer, textArea, buttonContainer } = styles;
    // You can set 'trueValue' as a prop and control it on father Component instead of use state.value
    const value = typeof trueValue !== 'undefined' ? trueValue : this.state.value;

    const lengthMsg = () => {
      const charQuantity = modalInfo.maxLength - value.length;
      return (
        <Text
          style={[
            Type.Regular,
            Type.fontSize(12),
            colorSet(charQuantity <= 0 ? colors.errorColor : colors.grayBlue),
          ]}
        >
          {I18n.t('storeReceiptModalFormLength').replace('$number', charQuantity)}
        </Text>
      );
    };

    return (
      <KyteModal
        fullPage
        fullPageTitle={modalInfo.title}
        fullPageTitleIcon="back-navigation"
        height={'100%'}
        isModalVisible
        hideFullPage={closeAction}
        hideOnBack
        rightIcons={rightIcon ? this.buildRightIcon() : null}
      >
        <CustomKeyboardAvoidingView style={avoidingContainer}>
          <View style={fieldContainer}>
            <ScrollView>
              <InputTextArea
                style={textArea}
                onChangeText={onChangeText || this.onChangeText.bind(this)}
                value={value}
                placeholder={this.props.placeholder || I18n.t('productSearchPlaceholderActive')}
                placeholderColor={colors.primaryGrey}
                autoFocus
                multiline
                textAlignVertical={'top'}
                autoCorrect
                noBorder
                hideLabel
                flex
                maxLength={modalInfo.maxLength || 999999}
                testID={testID}
              />
            </ScrollView>
          </View>
          <View style={lengthContainer}>{modalInfo.maxLength ? lengthMsg() : null}</View>
          <View style={buttonContainer}>
            <ActionButton onPress={() => buttonAction(value)}>
              {I18n.t('productSaveButton')}
            </ActionButton>
          </View>
        </CustomKeyboardAvoidingView>
        {isHelpModalVisible && this.props.helpModal
          ? this.props.helpModal(() => this.setState({ isHelpModalVisible: false }))
          : null}
      </KyteModal>
    );
  }
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const styles = {
  avoidingContainer: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  fieldContainer: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.littleDarkGray,
  },
  buttonContainer: {
    height: 70,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 100,
    lineHeight: 26,
  },
  lengthContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 15,
  },
};

export { StoreFormModal };
