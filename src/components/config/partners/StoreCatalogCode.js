import React, { Component } from 'react';
import { View, Alert, Text, Platform, Keyboard, Linking, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { getFormValues, isPristine, reduxForm, Field } from 'redux-form';

import { DetailPage, CustomKeyboardAvoidingView, Input, ActionButton } from '../../common';
import { scaffolding, Type, colorSet, colors, formStyle } from '../../../styles';
import I18n from '../../../i18n/i18n';

class StoreCatalogCode extends Component {
  static navigationOptions = () => ({
    header: null,
  });

  constructor(props) {
    super(props);
    this.state = {
      shrinkSection: false,
    };
  }

  UNSAFE_componentWillMount() {
    this.KeyboardShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow.bind(this)
    );
    this.KeyboardHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide.bind(this)
    );
  }

  componentWillUnmount() {
    this.KeyboardShowListener.remove();
    this.KeyboardHideListener.remove();
    Keyboard.dismiss();
  }

  keyboardDidShow() { this.setState({ shrinkSection: true }); }
  keyboardDidHide() { this.setState({ shrinkSection: false }); }

  formSubmit({ code }) {
    const { navigate } = this.props.navigation;
    switch (code.trim().toLowerCase()) {
      case 'amway': Keyboard.dismiss(); return navigate('StoreCatalogConfirm', { code: code.trim().toLowerCase() });
    }

    Alert.alert(I18n.t('words.s.attention'), I18n.t('partnerIntegrationNotFound'), [{ text: 'OK' }]);
  }

  renderField(field) {
    return (
      <Input
        {...field.input}
        onChangeText={field.input.onChange}
        onFocus={field.focusIn}
        onBlur={field.focusOut}
        placeholder={field.placeholder}
        keyboardType={field.kind}
        style={field.style}
        placeholderColor={field.placeholderColor}
        maxLength={field.maxLength}
        editable={field.editable}
        inputRef={field.inputRef}
        underlineColor={field.underlineColor}
        error={field.meta.touched ? field.meta.error : ''}
        substring={field.substring}
        displayIosBorder={field.displayIosBorder}
        hideLabel={field.hideLabel}
        returnKeyType="done"
        autoFocus={field.autoFocus}
        autoCapitalize="none"
      />
    );
  }

  render() {
    const { bottomContainer } = scaffolding;
    const { goBack } = this.props.navigation;
    const { fieldsContainer, textInfo, fieldHolder } = styles;
    const { inputLg } = formStyle;
    const { handleSubmit, formValues } = this.props;
    const hasCode = formValues && formValues.code && (formValues.code.trim().toLowerCase() === 'amway');

    return (
      <DetailPage pageTitle={I18n.t('partnerIntegrationCodeTitle')} goBack={goBack}>
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <View style={[fieldsContainer, { flex: 1, justifyContent: 'center' }]}>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto://${I18n.t('partnerIntegrationCodeInfoEmail')}`)} activeOpacity={0.8}>
              <Text style={textInfo}>
                {I18n.t('partnerIntegrationCodeInfo')} <Text style={Type.Bold}>{I18n.t('partnerIntegrationCodeInfoEmail')}</Text>
              </Text>
            </TouchableOpacity>

            <View style={[fieldHolder, { paddingTop: 10 }]}>
              <Field
                name="code"
                component={this.renderField}
                style={[inputLg, Type.Light, colorSet(colors.secondaryBg), Platform.select({ android: { height: 60 }, ios: { height: 50 } })]}
                autoFocus
                flex
                hideLabel
                maxLength={10}
              />
            </View>
          </View>
          <View style={bottomContainer}>
            <ActionButton
              alertTitle=''
              alertDescription={I18n.t('enterAllfields')}
              onPress={handleSubmit(this.formSubmit.bind(this))}
              disabled={!hasCode}
            >
              {I18n.t('paymentSplitButton')}
            </ActionButton>
          </View>
        </CustomKeyboardAvoidingView>
      </DetailPage>
    );
  }
}

const styles = {
  fieldsContainer: {
    paddingHorizontal: 20,
  },
  textInfo: [
    Type.fontSize(16),
    Type.Regular,
    colorSet(colors.secondaryBg),
    { textAlign: 'center' }
  ],
  fieldHolder: {
    width: '65%',
    alignSelf: 'center',
    paddingTop: 0,
  },
};

function validate(values) {
  const errors = {};
  if (!values.code) {
    errors.code = I18n.t('productValidateName');
  }
  return errors;
}

const StoreCatalogCodeForm = reduxForm({
  form: 'StoreCatalogCodeForm',
  validate
})(StoreCatalogCode);

export default connect(
  state => ({
    formValues: getFormValues('StoreCatalogCodeForm')(state),
    pristine: isPristine('StoreCatalogCodeForm')(state),
  }), null)(StoreCatalogCodeForm);
