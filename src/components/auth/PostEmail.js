import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Platform, Keyboard, Alert } from 'react-native';
import { Field, reduxForm, getFormValues } from 'redux-form';
import { CustomKeyboardAvoidingView, Input, ActionButton, KyteSafeAreaView } from '../common';
import { setUserEmail, verifySignIn } from '../../stores/actions';
import { emailValidate } from '../../util';
import { scaffolding, colors, Type } from '../../styles';
import I18n from '../../i18n/i18n';

class PostEmailComponent extends Component {
  sendEmail() {
    const { navigate } = this.props.navigation;
    const { email } = this.props.formValues;

    Keyboard.dismiss();

    this.props.verifySignIn(email, (response) => {
      if (response) return Alert.alert(I18n.t('emailAlreadyExists'));
      this.props.setUserEmail(email)
        .then(() => navigate('CurrentSale'));
    });
  }

  renderField(field) {
    console.log(field.meta.error);
    return (
      <Input
        {...field.input}
        onChangeText={field.input.onChange}
        // placeholder={I18n.t('words.s.email')}
        placeholder={''}
        placeholderColor={colors.primaryGrey}
        keyboardType={field.kind}
        style={[{ textAlign: 'center', paddingBottom: 15 }, style.field]}
        autoCapitalize={'none'}
        autoFocus
        error={field.meta.touched ? field.meta.error : ''}
      />
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { handleSubmit, formValues } = this.props;

    const validateError = formValues ? 'email' in emailValidate({ email: formValues.email }) : true;

    return (
      <KyteSafeAreaView style={outerContainer}>
        <View style={style.infoContainer}>
          <Text style={[Type.SemiBold, style.infoTitle]}>{I18n.t('postEmail.title')}</Text>
          <Text style={[Type.Regular, style.infoText]}>{I18n.t('postEmail.info1')}</Text>
          <Text style={[Type.Regular, style.infoText]}>{I18n.t('postEmail.info2')}</Text>
        </View>
        <CustomKeyboardAvoidingView>
          <View style={style.emailFieldView}>
            <Field name="email" kind="email-address" component={this.renderField} />
          </View>
          <View style={style.bottomContainer}>
            <ActionButton
              alertDescription={I18n.t('receiptShareFieldValidate.empty')}
              disabled={validateError}
              onPress={handleSubmit(this.sendEmail.bind(this))}
            >
              {I18n.t('words.s.proceed')}
            </ActionButton>
          </View>
        </CustomKeyboardAvoidingView>
      </KyteSafeAreaView>
    );
  }
}

const PostEmail = reduxForm({
  form: 'PostEmail',
  validate: emailValidate,
})(PostEmailComponent);

export default connect(
  (state) => ({
    formValues: getFormValues('PostEmail')(state),
  }),
  { setUserEmail, verifySignIn },
)(PostEmail);

const style = {
  infoContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingVertical: 20,
  },
  infoTitle: {
    color: colors.secondaryBg,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
  },
  infoText: {
    color: colors.secondaryBg,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 25,
    // marginTop: 20
  },
  emailFieldView: {
    marginHorizontal: 15,
    marginBottom: 40,
  },
  field: Platform.select({
    ios: {
      height: 32,
    },
  }),
  bottomContainer: {
    height: 70,
    justifyContent: 'center',
  },
};
