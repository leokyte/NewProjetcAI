import React, { Component } from 'react';
import { View, Alert, Text, Keyboard, Platform } from 'react-native';
import Share from 'react-native-share';
import { connect } from 'react-redux';
import _ from 'lodash';

import { KyteToolbar, ActionButton, CustomKeyboardAvoidingView, LoadingCleanScreen, TextButton, KyteSafeAreaView } from '../common';
import SigninPassword from '../auth/SigninPassword';
import UserPermissions from './UserPermissions';
import UserForm from './UserTabForm';
import { colors, scaffolding, Type } from '../../styles';
import I18n from '../../i18n/i18n';
import { addUser } from '../../stores/actions';
import { logEvent } from '../../integrations';
import { UserPermission } from '../../enums';

class UserAdd extends Component {
  constructor(props) {
    super(props);

    const currentPermissions = UserPermission.items.map(permission => ({ value: false, type: permission.type }));
    this.state = {
      index: 0,
      title: I18n.t('userNewToolbarTitleData'),
      textButton: I18n.t('words.s.proceed'),
      name: null,
      email: null,
      password: null,
      forceChangePassword: false,
      currentPermissions
    };
  }

  getPermission(permissionType, permissions = null) {
    return _.find(permissions || this.state.currentPermissions, permission => permission.type === permissionType);
  }

  submitForm() {
    const { index, name, email, password } = this.state;
    const { isOnline } = this.props;
    Keyboard.dismiss();

    if (!isOnline) {
      return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }]);
    }

    if (index === 2) {
      //const { forceChangePassword } = this.state;

      const userPermissions = {
        isAdmin: this.getPermission(UserPermission.ADMIN).value,
        allowPrivateDevice: this.getPermission(UserPermission.PERSONAL_PHONE).value,
        allowViewOtherSales: this.getPermission(UserPermission.SEE_ALL_SALES).value,
        allowSalesDiscount: this.getPermission(UserPermission.GIVE_DISCOUNT).value,
        allowProductsRegister: this.getPermission(UserPermission.MANAGE_PRODUCTS).value,
        allowStockManager: this.getPermission(UserPermission.MANAGE_STOCK).value,
        allowCustomerInDebt: this.getPermission(UserPermission.ALLOW_CUSTOMER_IN_DEBT).value
        //forcePswChange: forceChangePassword,
      };
      logEvent('Add User', { name, email });
      this.props.addUser(name, email, password, userPermissions, () => this.goToSendCredentials());
    }
  }

  goToSendCredentials() {
    const { navigate } = this.props.navigation;
    navigate(
      'UserConfirmation',
      {
        returnPreviousScreen: true,
        labelButton: I18n.t('words.s.ok').toUpperCase(),
        textConfirmation: this.renderPageConfirmation(),
        complexText: true
      }
    );
  }

  goBackAction() {
    const { navigation } = this.props;
    const { index } = this.state;

    switch (index) {
      default: case 0:
        navigation.goBack();
        break;
      case 1: case 2:
        this.modifyIndex(-1);
        break;
    }
  }

  changeUserPermissions(permissions) {
    const currentPermissions = permissions.map(permission => {
      return { ...this.getPermission(permission.type, permissions), value: permission.value };
    });
    this.setState({ currentPermissions });
  }

  modifyIndex(modify) {
    const { index } = this.state;
    let newIndex = 0;
    if (modify < 0) {
      newIndex = (index >= 1) ? index + (modify) : index;
    } else {
      newIndex = (index < 2) ? index + (modify) : index;
    }
    switch (newIndex) {
      default: case 0:
        this.setState({ title: I18n.t('userNewToolbarTitleData'), index: newIndex, textButton: I18n.t('words.s.proceed') });
        break;
      case 1:
        this.setState({ title: I18n.t('userNewToolbarTitlePermissions'), index: newIndex, textButton: I18n.t('words.s.proceed') });
        break;
      case 2:
        this.setState({ title: I18n.t('userNewToolbarTitlePassword'), index: newIndex, textButton: I18n.t('userCreateUserLabel') });
        break;
    }
  }

  disabledActionButton(index) {
    const { name, email } = this.state;

    if (index === 0 && name && email) {
      if (name.length > 0 && email.length > 0) {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i;

        if (!emailRegex.test(email)) {
          return true;
        }
      }
      return false;
    }

    if (index === 1) {
      return false;
    }

    if (index === 2 && this.state.password) {
      if (this.state.password.length > 5) {
        return false;
      }
    }

    return true;
  }

  shareCredentials(user) {
    const storeName = (this.props.store && this.props.store.name) ? this.props.store.name : '';

    const userName = (this.props.user && this.props.user.displayName) ? this.props.user.displayName : '';

    const owner = _.find(this.props.multiUsers, eachUser => {
      return !!(eachUser.permissions.isOwner);
    });

    const dowlodownloadedApp = user.adminPermission || user.personalPhonePermission ? `\n\n${I18n.t('userSuccessfulMsgShare4')}\nhttp://kyte.redirapp.com/` : '';

    const message = `${I18n.t('userSuccessfulMsgShare1')}${user.name}${I18n.t('userSuccessfulMsgShare2')}${storeName || owner.displayName || userName}${I18n.t('userSuccessfulMsgShare3')}\n\n${I18n.t('emailPlaceholder')}: ${user.email}\n${I18n.t('words.s.password')}: ${user.password}${dowlodownloadedApp}`;

    let credentials = { title: I18n.t('userSuccessfulTitleShare'), message };
    if (Platform.OS === 'android') {
      credentials = { ...credentials, url: '' };
    }
    Share.open(credentials);
  }

  renderTabs() {
    const { index } = this.state;
    switch (index) {
      default: case 0: return this.renderUserData();
      case 1: return this.renderUserPermission();
      case 2: return this.renderUserPassword();
    }
  }

  renderTabsIndicatorFooter() {
    const { index } = this.state;
    return (
      <View style={styles.tabFooterContainer}>
        <View style={[styles.tabFooterIndicator, { backgroundColor: index === 0 ? colors.secondaryBg : colors.secondaryBorderColor, }]} />
        <View style={[styles.tabFooterIndicator, { backgroundColor: index === 1 ? colors.secondaryBg : colors.secondaryBorderColor, }]} />
        <View style={[styles.tabFooterIndicator, { backgroundColor: index === 2 ? colors.secondaryBg : colors.secondaryBorderColor, }]} />
      </View>
    );
  }

  renderUserData() {
    const { innerSection } = styles;
    return (
      <View style={[styles.tabContentContainer, { justifyContent: 'center' }, innerSection]}>
        <UserForm
          typeForm={'Add'}
          nameCallBack={(value) => this.setState({ name: value })}
          emailCallBack={(value) => this.setState({ email: value })}
        />
      </View>
    );
  }

  renderUserPermission() {
    const { currentPermissions, name } = this.state;
    return (
      <UserPermissions
        permissions={currentPermissions}
        changeUserPermission={(permissions) => this.changeUserPermissions(permissions)}
        initialValues={{ name }}
      />
    );
  }

  renderUserPassword() {
    const { innerSection } = styles;
    return (
      <View style={innerSection}>
        <SigninPassword
          route={{ params: { origin: 'add-user' } }}
          passwordCallback={(value) => this.setState({ password: value })}
          forceChangePassword={(value) => this.setState({ forceChangePassword: value })}
        />
      </View>
    );
  }

  renderLoader() {
    return <LoadingCleanScreen />;
  }

  renderPageConfirmation() {
    const {
      name,
      email,
      password,
      adminPermission,
      personalPhonePermission
    } = this.state;

    const user = {
      name,
      email,
      password,
      adminPermission,
      personalPhonePermission
    };
    return (
      <View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[Type.Regular, Type.fontSize(18), { color: colors.primaryBg }]}>
            {I18n.t('userSuccessfulCreated')}
          </Text>
          <Text style={[Type.SemiBold, Type.fontSize(18), { color: colors.primaryBg, paddingVertical: 25 }]}>
            {email}
          </Text>
          <TextButton
            style={[Type.Regular, Type.fontSize(18), { color: colors.primaryBg, justifyContent: 'center', alignItems: 'center' }]}
            onPress={() => this.shareCredentials(user)}
          >
            {I18n.t('userSuccessfulCreatedShare1')}
            <Text style={[Type.SemiBold, { color: colors.actionColor }]}>
              {I18n.t('userSuccessfulCreatedShare2')}.
            </Text>
          </TextButton>
        </View>
      </View>
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { title, index, textButton } = this.state;
    const { navigate } = this.props.navigation;
    const { spaceBottom } = styles;
    const { visible } = this.props.loader;
    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          showCloseButton={index === 0}
          innerPage
          borderBottom={1.5}
          headerTitle={title}
          navigate={navigate}
          navigation={this.props.navigation}
          goBack={() => this.goBackAction()}
        />
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {this.renderTabs()}
            {this.renderTabsIndicatorFooter()}
          </View>
          <ActionButton
            style={spaceBottom}
            onPress={index === 2 ? () => this.submitForm() : () => this.modifyIndex(1)}
            disabled={this.disabledActionButton(index)}
            alertTitle={I18n.t('words.s.attention')}
            alertDescription={I18n.t('enterAllfields')}
          >
            {textButton}
          </ActionButton>
        </CustomKeyboardAvoidingView>
        {visible ? this.renderLoader() : null}
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  innerSection: {
    flex: 1,
    paddingHorizontal: 15
  },
  spaceBottom: {
    marginBottom: 10
  },
  tabContentContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  tabFooterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 120,
    paddingVertical: 10
  },
  tabFooterIndicator: {
    width: 6,
    height: 6,
    borderRadius: 5,
  },
};

export default connect(state => ({
  loader: state.common.loader,
  store: state.auth.store,
  user: state.auth.user,
  multiUsers: state.auth.multiUsers,
  isOnline: state.common.isOnline,
}), { addUser })(UserAdd);
