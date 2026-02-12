import React, { Component } from 'react';
import { View, Text, Keyboard, Platform, Dimensions, Image, Alert } from 'react-native';
import { connect } from 'react-redux';
import { Field, reduxForm, getFormValues } from 'redux-form';
import Intercom from '@intercom/intercom-react-native'

import {
  KyteToolbar,
  Input,
  ActionButton,
  LoadingCleanScreen,
  CustomKeyboardAvoidingView,
  KyteSafeAreaView,
} from '../common';
import {
  setUserReachedLimit,
  setInitialRouteName,
  verifySignInType,
  changeEmail,
  resendCodeValidation,
  forgotPassword,
} from '../../stores/actions';
import I18n from '../../i18n/i18n';
import { scaffolding, colors, Type } from '../../styles';
import { AccountConfirmationIcon } from '../../../assets/images';
import { totalLocalData } from '../../repository';
import { generateTestID } from '../../util'; // ana

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const SMALLEST_SCREENS = SCREEN_HEIGHT <= 480;

class SendCodeComponent extends Component {
  constructor(props) {
    super(props);
    const { params = {} } = this.props.route;
    const origin = params.origin || '';

    switch (origin) {
      case 'sign-password': case 'users-lock':
        this.state = {
          origin,
          shrinkSection: false,
          toolbarHeaderTitle: I18n.t('iForgotThePassword'),
          textLabel: I18n.t('iForgotThePasswordText'),
          buttonLabel: `${I18n.t('words.s.confirm')} ${I18n.t('words.s.email').toLowerCase()}`,
          buttonAlertDescription: I18n.t('receiptShareFieldValidate.empty'),
          rightButtons: this.rightButtons(),
        };
        break;
      case 'user-blocked':
        this.state = {
          origin,
          shrinkSection: false,
          toolbarHeaderTitle: I18n.t('confirmYourAccount'),
          textLabelAlert: I18n.t('verifyYourAccountToContinueUsing'),
          textLabel: I18n.t('blockedUserText'),
          buttonLabel: I18n.t('confirmYourAccountButton'),
          buttonAlertDescription: I18n.t('receiptShareFieldValidate.empty'),
          rightButtons: this.rightButtons(),
        };
        break;
      default:
        this.state = {
          origin: 'default',
          shrinkSection: false,
          destination: 'CurrentSale',
          toolbarHeaderTitle: I18n.t('confirmYourAccount'),
          textLabelAlert: I18n.t('confirmYourAccountText'),
          buttonLabel: I18n.t('confirmYourAccountButton'),
          buttonAlertDescription: I18n.t('receiptShareFieldValidate.empty'),
          rightButtons: this.rightButtons(),
        };
        break;
    }
  }

  UNSAFE_componentWillMount() {
    this.KeyboardShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow.bind(this),
    );
    this.KeyboardHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide.bind(this),
    );
  }

  componentDidMount() {
    const { initialValues } = this.props;

    if (initialValues.isLogged) {
      const totalRegisters = totalLocalData();
      const { userHasReachedLimit } = this.props;
      if (
        totalRegisters.totalSale + totalRegisters.totalProduct + totalRegisters.totalCustomer >=
          10 &&
        !userHasReachedLimit
      ) {
        // Unset the initial route name to avoid the user to be redirected to the blocked screen ( Temporary validation bug fix )
        // this.props.setUserReachedLimit(false);
        // this.props.setInitialRouteName('Home');
        this.setState({
          textLabel: I18n.t('blockedUserText'),
          textLabelAlert: I18n.t('verifyYourAccountToContinueUsing'),
          rightButtons: this.rightButtons(),
          origin: 'user-blocked',
        });
      }
    }
  }

  componentWillUnmount() {
    this.KeyboardShowListener.remove();
    this.KeyboardHideListener.remove();
  }

  openIntercomMessages() {    
    // método antigo que não sei onde é chamado
  }

  keyboardDidShow() { this.setState({ shrinkSection: true }); }

  keyboardDidHide() { this.setState({ shrinkSection: false }); }

  rightButtons() {
    const { params = {} } = this.props.route;
    const origin = params.origin || '';

    return [
      {
        icon: 'help',
        color: colors.actionColor,
        onPress:
          origin === 'sign-password' || origin === 'users-lock'
            ? () => this.openIntercomMessages()
            : () => Intercom.present(),
        iconSize: 22,
      },
    ];
  }

  goBack() {
    const { destination, origin } = this.state;
    const { navigate, goBack } = this.props.navigation;
    Keyboard.dismiss();

    if (origin === 'default') {
      navigate(destination);
    } else {
      goBack();
    }
  }

  goToConfirmation(provider) {
    switch (provider) {
      case 'password': return this.confirmationEmail();
      case 'google.com': return this.showAlert('Google');
      case 'facebook.com': return this.showAlert('Facebook');
      case undefined: return this.showAlert();
      default: return null;
    }
  }

  showAlert(provider) {
    const alertMessage = () => {
      switch (provider) {
        case 'Google': return I18n.t('signInWithGoogle');
        case 'Facebook': return I18n.t('signInWithFacebook');
        case undefined: return I18n.t('accountDoesNotExist');
        default: return I18n.t('accountDoesNotExist');
      }
    };

    Alert.alert(I18n.t('words.s.attention'), alertMessage(), [{ text: I18n.t('alertOk') }]);
  }

  verifyEmail() {
    const { signinEmail, formValues } = this.props;
    const { params = {} } = this.props.route;
    Keyboard.dismiss();

    if (params.origin === 'users-lock') {
      const navigateToConfirmation = () => {
        this.props.navigation.navigate('UsersLockCode', { origin: 'users-lock' });
      };
      this.props.forgotPassword(params.user.email || signinEmail, navigateToConfirmation.bind(this));
      return;
    }

    if (signinEmail !== this.props.initialValues.signinEmail && formValues && formValues.isLogged) {
      this.props.changeEmail(signinEmail, this.confirmationEmail());
    } else {
      this.props.forgotPassword(signinEmail);
      this.props.verifySignInType(signinEmail, this.goToConfirmation.bind(this));
    }
  }

  confirmationEmail() {
    const { navigate } = this.props.navigation;
    const { origin } = this.state;

    Keyboard.dismiss();
    navigate('AccountConfirmation', { origin });
  }

  navigateUserBlocked() {
    const { navigate } = this.props.navigation;
    const { params = {} } = this.props.route;

    return (params.previousScreen) ? navigate(params.previousScreen) : navigate('CurrentSale');
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
        autoCapitalize={field.autoCapitalize}
        error={field.meta.touched ? field.meta.error : ''}
        editable={field.editable}
        returnKeyType="done"
      />
    );
  }

  renderButton() {
    const { bottomContainer } = styles;
    const { buttonLabel, buttonAlertDescription } = this.state;
    return (
      <View style={bottomContainer}>
        <ActionButton
          alertDescription={buttonAlertDescription}
          onPress={() => this.verifyEmail()}
        >
          {buttonLabel}
        </ActionButton>
      </View>
    );
  }

  renderTextLabelIForgotMyPassword() {
    const { textLabelStyle, textLabelContainer } = styles;
    const { textLabel, shrinkSection } = this.state;

    return (
      <View
        style={[
          textLabelContainer,
          {
            marginTop: shrinkSection && SMALLEST_SCREENS ? 50 : 30,
            marginBottom: shrinkSection && SMALLEST_SCREENS ? 20 : 50,
          },
        ]}
      >
        <Text style={textLabelStyle}>{textLabel}</Text>
      </View>
    );
  }

  renderTextLabel() {
    const { textLabelContainer, textLabelAlertStyle } = styles;
    const { textLabelAlert } = this.state;

    return (
      <View style={textLabelContainer}>
        <Text style={textLabelAlertStyle}>{textLabelAlert}</Text>
      </View>
    );
  }

  renderImageAccountConfirmation() {
    const { topContainer, svgImage } = styles;
    return (
      <View style={topContainer}>
        <Image style={svgImage} source={{ uri: AccountConfirmationIcon }} />
      </View>
    );
  }

  renderLoader() {
    return <LoadingCleanScreen />;
  }

  renderUserEmail() {
    const { textLabelStyle, field } = styles;
    const { origin, shrinkSection } = this.state;
    const { signinEmail } = this.props.initialValues;
    const { params } = this.props.route;

    const renderForgotPassword = () => (
        <View
          style={{
            height: shrinkSection && SMALLEST_SCREENS ? 50 : 70,
            marginBottom: shrinkSection && SMALLEST_SCREENS ? 20 : 0,
          }}
        >
          <Field
            placeholder={I18n.t('words.s.email')}
            placeholderColor={colors.primaryGrey}
            name="signinEmail"
            kind="email-address"
            component={this.renderField}
            style={field}
            autoCapitalize="none"
            editable={false}
          />
        </View>
      );

    const renderConfirmation = () => {
      const email = params && params.user ? params.user.email : signinEmail;
      return (
        <Text
          {...generateTestID('TEST-1')}
          style={[
            textLabelStyle,
            origin === 'sign-password' || origin === 'users-lock' ? Type.SemiBold : null,
          ]}
        >
          {email}
        </Text>
      );
    };

    return (
      <View>
        {origin === 'sign-password' || origin === 'users-lock' ? this.renderTextLabelIForgotMyPassword() : this.renderTextLabel() }
        {renderConfirmation()}
        {/* {origin === 'sign-password' ? renderForgotPassword() : renderConfirmation()} */}
      </View>
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { fieldsContainer } = styles;
    const { toolbarHeaderTitle, origin, shrinkSection } = this.state;
    const { visible } = this.props.loader;
    const { navigate, goBack } = this.props.navigation;

    const checkRenderImage = () => {
      if ((origin === 'default' || origin === 'user-blocked') && !SMALL_SCREENS) {
        return this.renderImageAccountConfirmation();
      }

      if ((origin === 'default' || origin === 'user-blocked') && SMALL_SCREENS) {
        return shrinkSection ? null : this.renderImageAccountConfirmation();
      }
    };

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage={origin !== 'default'}
          borderBottom={1.5}
          headerTitle={toolbarHeaderTitle}
          goBack={origin === 'user-blocked' ? () => this.navigateUserBlocked() : () => goBack()}
          navigate={navigate}
          navigation={this.props.navigation}
          rightButtons={this.state.rightButtons}
          testProps={generateTestID('TEST-CODE')}
        />
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <View style={fieldsContainer}>
            {checkRenderImage()}
            {this.renderUserEmail()}
          </View>
          {this.renderButton()}
        </CustomKeyboardAvoidingView>
        {visible ? this.renderLoader() : null}
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  fieldsContainer: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  textLabelAlertStyle: {
    color: colors.secondaryBg,
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  textLabelStyle: {
    color: colors.primaryBg,
    fontFamily: 'Graphik-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  textLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
  },
  bottomButtons: {
    height: 60,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  bottomContainer: {
    height: 70,
    justifyContent: 'center',
  },
  field: Platform.select({
    ios: {
      height: 32,
    }
  }),
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.drawerIcon,
    maxHeight: Dimensions.get('window').height * 0.25,
  },
  svgImage: {
    resizeMode: 'contain',
    width: Dimensions.get('window').width * 0.25,
    height: Dimensions.get('window').height * 0.25,
  }
};

const validate = (values) => {
  const errors = {};
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i;

  if (values.signinEmail && !emailRegex.test(values.signinEmail)) {
    errors.signinEmail = I18n.t('receiptShareFieldValidate.invalid');
  }
  return errors;
};

const SendCode = reduxForm({
  form: 'SendCode',
  validate,
})(SendCodeComponent);

export default connect(
  (state) => ({
    formValues: getFormValues('SendCode')(state),
    initialValues: state.auth,
    signinEmail: state.auth.signinEmail,
    loader: state.common.loader,
    userHasReachedLimit: state.common.userHasReachedLimit,
  }),
  {
    changeEmail,
    verifySignInType,
    setUserReachedLimit,
    setInitialRouteName,
    resendCodeValidation,
    forgotPassword,
  },
)(SendCode);
