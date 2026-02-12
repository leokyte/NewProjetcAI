import React, { Component } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  Keyboard,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { Field, reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { KyteSwitch } from '@kyteapp/kyte-ui-components';
import { Input, CustomKeyboardAvoidingView, KyteModal, TextButton, KyteSafeAreaView, ActionButton } from '../common';
import { colors, scaffolding, Type } from '../../styles';
import I18n from '../../i18n/i18n';
import { InativateUser } from '../../../assets/images';

class UserTabForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tipType: null,
      onPressTip: false,
      isModalVisible: false,
      resetPassword: false,
      modalTitle: '',
      shrinkSection: false,
      name: null,
      email: null,
      inactivateUser: false,
      isOwner: false,
    };
  }

  UNSAFE_componentWillMount() {
    this.KeyboardShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
    this.KeyboardHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));

    const { initialValues } = this.props;
    if (initialValues && initialValues.displayName && initialValues.email) {
      this.setState({
        name: initialValues.displayName,
        email: initialValues.email,
        isOwner: initialValues.permissions.isOwner,
        inactivateUser: !initialValues.active,
      });
    }
  }

  componentWillUnmount() {
    this.KeyboardShowListener.remove();
    this.KeyboardHideListener.remove();
  }

  keyboardDidShow() { this.setState({ shrinkSection: true }); }

  keyboardDidHide() { this.setState({ shrinkSection: false }); }

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
        returnKeyType="done"
        autoFocus={field.autoFocus}
        editable={field.editable}
      />
    );
  }

  renderTip(type, onPress) {
    const { name } = this.state;
    const height = Dimensions.get('window').height * 0.25;
    const width = height * 0.6;

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ marginBottom: '15%' }}>
            <Image source={{ uri: InativateUser }} style={{ width, height }} />
          </View>
          <View style={{ paddingHorizontal: '15%' }}>
            <Text style={{ color: colors.secondaryBg, textAlign: 'center', fontSize: 18, lineHeight: 25 }}>
              {I18n.t('userEditInactivateUserText1')} <Text style={Type.SemiBold}>{name}</Text> {I18n.t('userEditInactivateUserText2')}
            </Text>
          </View>
        </View>
        <View style={{ paddingVertical: 15 }}>
          <ActionButton onPress={onPress}>
            {I18n.t('userEditInactivateUser')}
          </ActionButton>
        </View>
      </View>
    );
  }

  renderUserData() {
    const { tabContentContainer, userInativeContainer, userInativeText, userInativeSwitch, alignContent, inputContainer } = styles;
    const { inactivateUser, shrinkSection, isOwner } = this.state;
    const { changeInactivateUser, nameCallBack, emailCallBack, typeForm, user } = this.props;
    const { navigation, isOnline } = this.props;

    const onChangeInativateBtn = () => {
      this.setState({
        isModalVisible: true,
        modalTitle: I18n.t('userEditInactivateUser'),
        tipType: 0,
        onPressTip: () => {
          changeInactivateUser();
          this.setState({ isModalVisible: false, inactivateUser: !inactivateUser });
        }
      });
    };

    const onChangeInactivateUser = () => {
      if (inactivateUser) {
        this.setState({ inactivateUser: !inactivateUser });
        changeInactivateUser();
      } else {
        onChangeInativateBtn();
      }
    };

    const goToUserConfirmPassword = () => {
      if (!isOnline) {
        return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }]);
      }
      navigation.navigate('UserConfirmPassword', { origin: 'reset-password', user });
    };

    const renderUserEdit = () => (
        <View>
          <TouchableOpacity onPress={() => onChangeInactivateUser()}>
            <View style={userInativeContainer}>
              <View style={userInativeText}>
                <Text style={[Type.Regular, Type.fontSize(16)]}>
                  {I18n.t('userEditInactivateUser')}
                </Text>
              </View>
              <View style={userInativeSwitch}>
              <KyteSwitch
                onValueChange={() => onChangeInactivateUser()}
                active={inactivateUser}
              />
              </View>
            </View>
          </TouchableOpacity>
          <View style={[alignContent, { paddingTop: 15 }]}>
            <TextButton
              onPress={() => goToUserConfirmPassword()}
              title={I18n.t('userEditResetPassword')}
              style={[Type.Medium, { fontSize: 15 }]}
              color={colors.actionColor}
            />
          </View>
        </View>
      );

    return (
      <View style={[tabContentContainer, { justifyContent: 'center' }]}>
        <View style={inputContainer}>
          <Field
            placeholder={I18n.t('namePlaceholder')}
            placeholderColor={colors.primaryGrey}
            name="displayName"
            component={this.renderField}
            autoCapitalize="words"
            style={[isOwner ? { color: colors.disabledColor } : null, Platform.select({ ios: { height: 32 } })]}
            onChange={(event, newValue) => nameCallBack(newValue)}
            editable={!isOwner}
          />
        </View>
        <View style={inputContainer}>
          <Field
            placeholder={I18n.t('words.s.email')}
            placeholderColor={colors.primaryGrey}
            name="email"
            kind="email-address"
            autoCapitalize="none"
            component={this.renderField}
            style={[isOwner ? { color: colors.disabledColor } : null, Platform.select({ ios: { height: 32 } })]}
            onChange={(event, newValue) => emailCallBack(newValue)}
            editable={!isOwner}
          />
        </View>
        {typeForm === 'Edit' && !shrinkSection && !isOwner ? renderUserEdit() : null}
      </View>
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { innerSection } = styles;
    const { typeForm } = this.props;
    const { tipType, onPressTip } = this.state;
    return (
      <KyteSafeAreaView style={outerContainer}>
        <CustomKeyboardAvoidingView style={innerSection}>
          <View style={[innerSection, { paddingHorizontal: typeForm === 'Edit' ? 15 : 5 }]}>
            {this.renderUserData()}
          </View>
        </CustomKeyboardAvoidingView>
        <KyteModal
          height="100%"
          fullPage
          fullPageTitle={this.state.modalTitle}
          fullPageTitleIcon="back-navigation"
          hideOnBack
          hideFullPage={() => this.setState({ isModalVisible: false })}
          isModalVisible={this.state.isModalVisible}
        >
          {this.renderTip(tipType, onPressTip)}
        </KyteModal>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  innerSection: {
    flex: 1,
  },
  alignContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabContentContainer: {
    flex: 1,
    justifyContent: 'space-around',
    paddingTop: 40,
    paddingBottom: 20
  },
  inputContainer: {
    paddingVertical: 3
  },
  userInativeContainer: {
    paddingLeft: 5,
    flexDirection: 'row',
    height: 60,
  },
  userInativeText: {
    flex: 0.8,
    alignItems: 'center',
    flexDirection: 'row'
  },
  userInativeSwitch: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'flex-end'
  }
};

const validate = (values) => {
  const errors = {};
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i;
  if (!values.name) {
    errors.name = 'Preencha o nome do usuário';
  }
  if (!values.email) {
    errors.email = 'Preencha o e-mail do usuário';
  }

  if (values.email && !emailRegex.test(values.email)) {
    errors.email = 'E-mail inválido';
  }
  return errors;
};

const UserForm = reduxForm({
  form: 'UserForm',
  validate,
  destroyOnUnmount: false
})(UserTabForm);

export default connect(
  state => ({
    formValues: getFormValues('UserForm')(state),
    initialValues: state.user.detail,
    isOnline: state.common.isOnline,
    user: state.user.detail,
}))(UserForm);
