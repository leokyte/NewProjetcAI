import React, { Component } from 'react';
import { View, Text, Keyboard, Alert, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Field, reduxForm, getFormValues } from 'redux-form';
import moment from 'moment/min/moment-with-locales';
import { Input, ActionButton, KyteToolbar, KyteModal, TextButton, ConclusionIcon, CustomKeyboardAvoidingView, KyteSafeAreaView } from '../../common';
import { scaffolding, formStyle, colors, Type, colorSet } from '../../../styles';
import { receiptMailSent, sendReceiptByMail, resetMailTo } from '../../../stores/actions';
import { logEvent } from '../../../integrations';
import I18n from '../../../i18n/i18n';
import { isSmallScreen } from '@kyteapp/kyte-ui-components';

class ReceiptSendEmail extends Component {
  constructor(props) {
    super(props);

    const initalEmail = props.initialValues && props.initialValues.email;
    this.state = {
      isModalVisible: false,
      textAlign: initalEmail ? 'left' : 'center',
    };
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  setSendStatus() {
    const { navigate } = this.props.navigation;
    const { params } = this.props.route;
    const { origin } = params;

    logEvent('Receipt Emailed');
    if (origin === 'currentSale') {
      navigate('Receipt', { navigateBack: true });
      this.props.receiptMailSent(true);
    } else {
      this.setState({ isModalVisible: true });
    }
  }

  goBackFromEmail() {
    const { goBack } = this.props.navigation;
    const { params } = this.props.route;
    const { routeKey } = params;

    this.setState({ isModalVisible: false });
    this.timer = setTimeout(() => {
      goBack(routeKey);
    });
  }

  buttonsFromSale() {
    const { buttonSpacing } = styles;

    return (
      <View>
        <ActionButton
          style={buttonSpacing}
          onPress={() => this.goBackFromEmail()}
          cancel
        >
          {I18n.t('receiptBackToSaleButton')}
        </ActionButton>
      </View>
    );
  }

  buttonsFromOpenedSales() {
    const { buttonSpacing } = styles;

    return (
      <View>
        <ActionButton
          style={buttonSpacing}
          onPress={() => this.goBackFromEmail()}
          cancel
        >
          {I18n.t('receiptBackToOpenedSalesButton')}
        </ActionButton>
      </View>
    );
  }

  buttonsFromReceiptPreview() {
    const { buttonSpacing } = styles;

    return (
      <View>
        <ActionButton
          style={buttonSpacing}
          onPress={() => this.goBackFromEmail()}
          cancel
        >
          {I18n.t('receiptBackToReceiptButton')}
        </ActionButton>
      </View>
    );
  }

  resetEmail() {
    this.props.resetMailTo();
    this.props.reset();
  }

  receiptSender() {
    const { formValues, storeAuth, user, currency, decimalCurrency, isOnline } = this.props;
    const receiver = formValues.email;
    const { params } = this.props.route;
    const { sale } = params;
    const { currencySymbol, decimalSeparator, groupingSeparator } = currency;
    const store = {
      name: storeAuth.name,
      email: !storeAuth.email ? user.email : storeAuth.email,
      storeImageUrl: storeAuth.imageURL || '',
      phone: storeAuth.phone,
      headerExtra: storeAuth.headerExtra || '',
      footerExtra: storeAuth.footerExtra || '',
      customerExtra: !!sale.customer // Ignore real 'customerExtra'. We check this and ACCOUNT payment in ReceiptShareOptions to allow customer in receipt
    };

    const emailContent = {
      receiver,
      userLanguage: I18n.t('locale'),
      currency: `${currencySymbol} `,
      decimalSeparator,
      groupingSeparator,
      decimalCurrency,
      store,
      sale: {
        ...sale,
        customer: store.customerExtra && sale.customer ? { ...sale.customer, balanceLabel: I18n.t('words.s.balance') } : null,
        dateCreation: moment(sale.dateCreation).format('LLL'),
        dateCreationFormatted: true
      }
    };

    Keyboard.dismiss();
    if (!isOnline) {
      return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: 'OK' }]);
    }

    this.props.sendReceiptByMail(emailContent);
    this.setSendStatus();
  }

  renderField(field) {
    return (
      <Input
        {...field.input}
        onChangeText={field.input.onChange}
        placeholder={field.placeholder}
        keyboardType={field.kind}
        style={field.style}
        placeholderColor={field.placeholderColor}
        maxLength={field.maxLength}
        error={field.meta.touched ? field.meta.error : ''}
        autoCapitalize={field.autoCapitalize}
        returnKeyType="done"
        flex
      />
    );
  }

  renderStatusMessage() {
    const { messageContainer } = styles;
    return (
      <View style={messageContainer}>
        <Text style={[Type.Medium, colorSet(colors.actionColor)]}>{I18n.t('receiptShareEmailSent')}</Text>
      </View>
    );
  }

  renderSendButton() {
    const { bottomContainer } = scaffolding;
    const { handleSubmit, formValues } = this.props;
    const { params } = this.props.route;

    //
    // Você pode passar um `receiptSender()` como parâmetro de navegação para esta página
    // tornando a página genérica
    //

    return (
      <View style={bottomContainer}>
        <ActionButton
          alertDescription={I18n.t('receiptShareFieldValidate.empty')}
          disabled={!formValues}
          onPress={
            handleSubmit(
              params.receiptSender ?
              () => params.receiptSender(formValues.email, () => this.setState({ isModalVisible: true })) :
              this.receiptSender.bind(this)
            )
          }
        >
          {I18n.t('words.s.send')}
        </ActionButton>
      </View>
    );
  }

  renderClearInput() {
    const { formValues } = this.props;
    return (
      <TextButton
        title={I18n.t('receiptClearEmailButton')}
        onPress={() => this.resetEmail()}
        color={formValues ? colors.actionColor : colors.primaryGrey}
        style={formValues ? { fontFamily: 'Graphik-Medium' } : null}
      />
    );
  }

  renderModalButtons() {
    const { params } = this.props.route;
    const { origin } = params;

    switch (origin) {
      case 'sale': return this.buttonsFromSale();
      case 'opened-sales': return this.buttonsFromOpenedSales();
      case 'receipt-preview': return this.buttonsFromReceiptPreview();
      case 'customer-account': return this.buttonsFromReceiptPreview();
      default: return null;
    }
  }

  render() {
    const { outerContainer } = scaffolding;
    const { fieldsContainer, inputGroup } = formStyle;
    const { inputStyle, bottomContent, mailSentContainer, mailSentTitle } = styles;
    const {  navigation, viewport } = this.props;
    const { isModalVisible, textAlign } = this.state;

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={I18n.t('receiptShareOptions.email')}
          goBack={navigation.goBack}
        />
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <View style={{ flex: 1 }} />
            <View style={fieldsContainer}>
              <View style={inputGroup}>
                <Field
                  placeholder={I18n.t('receiptShareEmailPlaceHolder')}
                  placeholderColor={colors.primaryGrey}
                  name='email'
                  kind='email-address'
                  autoCapitalize="none"
                  component={this.renderField}
                  style={inputStyle(textAlign)}
                  onFocus={() => this.setState({ textAlign: 'left' })}
                />
              </View>
              <View style={bottomContent}>
                {this.renderClearInput()}
              </View>
            </View>
          {this.renderSendButton()}
        </CustomKeyboardAvoidingView>

        <KyteModal
          fullPage={isSmallScreen(viewport)}
          height={'100%'}
          isModalVisible={isModalVisible}
        >
          <View style={{ flex: 1 }}>
            <View style={mailSentContainer}>
              <View style={{ height: 190 }}>
                <Text style={mailSentTitle}>{I18n.t('receiptShareEmailSent')}</Text>
                <ConclusionIcon type={'check'} size={120} />
              </View>
            </View>
          </View>
          {this.renderModalButtons()}
        </KyteModal>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  messageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40
  },
  bottomContent: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mailSentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mailSentTitle: {
    fontSize: 24,
    fontFamily: 'Graphik-Semibold',
    color: colors.primaryColor,
    textAlign: 'center',
    marginBottom: 30
  },
  buttonSpacing: {
    marginBottom: 10
  },
  inputStyle: (textAlign) => {
    return {
      textAlign,
      ...Platform.select({ ios: { height: 35 } })
    };
  },
};

function validate(values) {
  const errors = {};

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i;
   if (values.email && !emailRegex.test(values.email)) {
    errors.email = I18n.t('receiptShareFieldValidate.invalid');
  }

  if (!values.email) {
   errors.email = I18n.t('receiptShareFieldValidate.empty');
 }

  return errors;
}

const SendEmail = reduxForm({
  form: 'SendEmail',
  validate,
  enableReinitialize: true,
})(ReceiptSendEmail);

const mapStateToProps = (state) => {
  const { auth } = state;
  const { receiptEmailReceiver, viewport } = state.common;
  const { currency, decimalCurrency } = state.preference.account;
  const { isOnline } = state.common;

  return {
    formValues: getFormValues('SendEmail')(state),
    initialValues: receiptEmailReceiver,
    user: auth.user,
    storeAuth: auth.store,
    currency,
    decimalCurrency,
    isOnline,
    viewport,
  };
};

export default connect(mapStateToProps, {
  receiptMailSent,
  sendReceiptByMail,
  resetMailTo,
})(SendEmail);
