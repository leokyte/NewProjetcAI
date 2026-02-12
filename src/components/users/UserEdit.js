import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Alert, Dimensions, Platform } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import {
  isFree,
  isPro,
  isGrow,
  isPrime,
  KyteBox,
  PLAN_FREE,
  PLAN_PRO,
  PLAN_GROW,
  PLAN_PRIME,
} from '@kyteapp/kyte-ui-components';

import { scaffolding, colors, Type } from '../../styles';
import {
  KyteToolbar,
  ActionButton,
  CurrencyText,
  KyteModal,
  Tip,
  CustomKeyboardAvoidingView,
  LoadingCleanScreen,
  KyteSafeAreaView,
  KyteTabBar,
} from '../common';
import UserSales from './UserSales';
import UserPermissions from './UserPermissions';
import UserForm from './UserTabForm';
import I18n from '../../i18n/i18n';
import {
  checkUserPermission,
  checkUserPermissionWithType,
  hasFilters,
  generateDefaultPROFeatures,
  getPROFeature,
} from '../../util';
import {
  editUser,
  deleteUser,
  cleanUserForm,
  salesSetFilter,
  ordersSetFilter,
  salesClearFilter,
  ordersClearFilter,
} from '../../stores/actions';
import { UserPermission } from '../../enums';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const initialLayout = { width: Dimensions.get('window').width };

class UserEdit extends Component {
  static navigationOptions = () => {
    return {
      header: null,
    };
  };

  constructor(props) {
    super(props);

    const splitPaymentTabs = [
      { key: '1', title: I18n.t('userEditTabData').toUpperCase() },
      { key: '2', title: I18n.t('userEditTabPermissions').toUpperCase() },
      { key: '3', title: I18n.t('userEditTabSells').toUpperCase() },
      { key: '4', title: I18n.t('sideMenu.orders').toUpperCase() },
    ];

    const { auth, initialValues } = this.props;

    const permissions = checkUserPermission(initialValues.permissions);
    const currentPermissions = checkUserPermissionWithType(initialValues.permissions);

    this.state = {
      index: 0,
      routes: splitPaymentTabs,
      name: initialValues.displayName,
      email: initialValues.email,
      password: null,
      forceChangePassword: false,
      currentPermissions,
      havePermissionSave: permissions.isOwner || auth.user.uid === initialValues.uid,
      onPressTip: false,
      isModalVisible: false,
      modalTitle: '',
      inactivateUser: !initialValues.active,
      userLimit: generateDefaultPROFeatures('PROUserLimit'),
    };
  }

  componentWillUnmount() {
    this.props.salesClearFilter();
    this.props.ordersClearFilter();
    this.getPROFeatures();
  }

  async getPROFeatures() {
    const userLimitVal = await getPROFeature('PROUserLimit');

    userLimitVal && this.setState({ userLimit: userLimitVal });
  }

  getPermission(permissionType, permissions = null) {
    return _.find(
      permissions || this.state.currentPermissions,
      (permission) => permission.type === permissionType,
    );
  }

  onRequestChangeTab = (index) => this.setState({ index });

  submitForm() {
    const { forceChangePassword, name, email, inactivateUser } = this.state;
    const { isOnline, route } = this.props;
    const { user } = route.params;

    const userPermissions = {
      isAdmin: this.getPermission(UserPermission.ADMIN).value,
      allowPrivateDevice: this.getPermission(UserPermission.PERSONAL_PHONE).value,
      allowViewOtherSales: this.getPermission(UserPermission.SEE_ALL_SALES).value,
      allowSalesDiscount: this.getPermission(UserPermission.GIVE_DISCOUNT).value,
      allowProductsRegister: this.getPermission(UserPermission.MANAGE_PRODUCTS).value,
      allowStockManager: this.getPermission(UserPermission.MANAGE_STOCK).value,
      allowCustomerInDebt: this.getPermission(UserPermission.ALLOW_CUSTOMER_IN_DEBT).value,
      forcePswChange: forceChangePassword,
    };

    if (!isOnline) {
      return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [
        { text: I18n.t('alertOk') },
      ]);
    }

    this.props.editUser(
      { uid: user.uid, email: user.email, psw: user.psw, displayName: name },
      { email },
      { permissions: userPermissions, active: !inactivateUser },
      this.goToUsersListBySaveUser.bind(this),
    );
  }

  goToUsersListBySaveUser() {
    const { navigate } = this.props.navigation;
    navigate('UserConfirmation', {
      returnPreviousScreen: true,
      labelButton: I18n.t('words.s.ok').toUpperCase(),
      textConfirmation: this.renderPageConfirmation(),
      complexText: true,
    });
  }

  deleteUser() {
    const { isOnline } = this.props;
    if (!isOnline) {
      return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [
        { text: I18n.t('alertOk') },
      ]);
    }

    this.setState({
      isModalVisible: true,
      modalTitle: I18n.t('userDeleteTitleButton'),
      onPressTip: () => {
        const navigateToSuccess = () => {
          const { navigate } = this.props.navigation;
          navigate('UserConfirmation', {
            returnPreviousScreen: true,
            labelButton: I18n.t('words.s.ok').toUpperCase(),
            textConfirmation: I18n.t('userSuccessfulDeleted'),
            complexText: false,
          });
        };

        this.setState({ isModalVisible: false });
        const { user } = this.props.route.params;
        this.props.deleteUser(user, navigateToSuccess.bind(this));
      },
    });
  }

  changeUserPermission(permissions) {
    const currentPermissions = permissions.map((permission) => {
      return { ...this.getPermission(permission.type, permissions), value: permission.value };
    });
    this.setState({ currentPermissions });
  }

  renderPageConfirmation() {
    const { infoStyle } = styles;
    const { name, inactivateUser } = this.state;
    const startMsg = inactivateUser
      ? I18n.t('UserInactivatedAlert1')
      : I18n.t('userEditSuccessfulAlertOfUptade1');
    const endMsg = inactivateUser
      ? I18n.t('UserInactivatedAlert2')
      : I18n.t('userEditSuccessfulAlertOfUptade2');

    return (
      <View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[infoStyle, Type.SemiBold]}>{I18n.t('userEditSuccessful')}</Text>
          <Text
            style={[
              infoStyle,
              { paddingVertical: 25, justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            {startMsg}
            <Text style={Type.SemiBold}>{` ${name} `}</Text>
            {endMsg}
          </Text>
        </View>
      </View>
    );
  }

  renderHeader = (props) => (
    <KyteTabBar
      labelContainerStyle={{ width: 120 }}
      labelTextStyle={Type.fontSize(SMALL_SCREENS ? 11 : 13)}
      inactiveColor={colors.primaryGrey}
      {...props}
    />
  );

  renderTabUserData = () => {
    const { inactivateUser } = this.state;
    return (
      <View style={{ flex: 1, paddingTop: 10 }}>
        <UserForm
          formId="my_form"
          typeForm="Edit"
          nameCallBack={(value) => this.setState({ name: value })}
          emailCallBack={(value) => this.setState({ email: value })}
          changeInactivateUser={() => {
            this.setState({ inactivateUser: !inactivateUser });
          }}
          navigation={this.props.navigation}
        />
      </View>
    );
  };

  renderTabPermission = () => {
    const { currentPermissions, name } = this.state;
    const { initialValues } = this.props;
    const permissions = checkUserPermission(initialValues.permissions);
    return (
      <UserPermissions
        permissions={currentPermissions}
        isOwner={permissions.isOwner}
        changeUserPermission={(permissions) => this.changeUserPermission(permissions)}
        initialValues={{ name }}
        formType="Edit"
      />
    );
  };

  renderTabSales = (salesType) => {
    const { params = {} } = this.props.route;
    const { user } = params;

    return (
      <View style={styles.innerSection}>
        <UserSales navigation={this.props.navigation} user={user} salesType={salesType} />
      </View>
    );
  };

  renderSaveButton() {
    const { spaceBottom, buttonContainer } = styles;
    const { name, email } = this.state;
    return (
      <View style={buttonContainer}>
        <ActionButton
          style={spaceBottom}
          onPress={() => this.submitForm()}
          disabled={!name || !email}
        >
          {I18n.t('alertSave')}
        </ActionButton>
      </View>
    );
  }

  renderTotalSale() {
    const { totalSales, totalBottom, total } = styles;
    return (
      <View style={totalSales}>
        <Text
          style={[
            Type.SemiBold,
            Type.fontSize(15),
            Type.ColorLight,
            { paddingTop: 5, paddingBottom: 3 },
          ]}
        >
          {I18n.t('salesTotalTitle')}
        </Text>
        <View style={totalBottom}>
          <Text
            style={[
              total,
              Type.Regular,
              Type.fontSize(14),
              Type.ColorLight,
              { paddingTop: 3, paddingBottom: 5 },
            ]}
          >
            <CurrencyText value={340.3} />
            {` ${I18n.t('words.s.at')}`} {14} {I18n.t('words.s.sale')}
          </Text>
        </View>
      </View>
    );
  }

  renderTip(onPress) {
    const textHeaderImage = () => {
      return (
        <View style={{ flex: 0.3, justifyContent: 'flex-end', paddingHorizontal: 20 }}>
          <Text
            style={[
              Type.SemiBold,
              Type.fontSize(22),
              {
                textAlign: 'center',
                paddingHorizontal: 20,
                color: colors.primaryBg,
                marginBottom: 5,
              },
            ]}
          >
            {I18n.t('userDeleteTitle')}
          </Text>
        </View>
      );
    };

    const textFooterImage = () => {
      return (
        <View style={{ flex: 0.7, paddingHorizontal: 20 }}>
          <View style={{ flex: 0.5, justifyContent: 'flex-start' }}>
            <Text
              style={[
                Type.Regular,
                Type.fontSize(16),
                { marginBottom: 3, textAlign: 'center', color: colors.primaryBg },
              ]}
            >
              {I18n.t('userDeleteConfirm')}
            </Text>
            <Text
              style={[
                Type.SemiBold,
                Type.fontSize(18),
                { textAlign: 'center', color: colors.primaryBg },
              ]}
            >
              {this.state.name}?
            </Text>
          </View>
          <View style={{ flex: 0.5, justifyContent: 'flex-end' }}>
            <Text
              style={[
                Type.Regular,
                Type.fontSize(14),
                { lineHeight: 15, textAlign: 'center', color: colors.grayBlue, marginBottom: 20 },
              ]}
            >
              {`${I18n.t('userDeleteConfirmBottom1')} `}
              <Text style={Type.SemiBold}>{this.state.name}</Text>
              {` ${I18n.t('userDeleteConfirmBottom2')}`}
            </Text>
          </View>
        </View>
      );
    };
    return (
      <Tip
        textHeaderImage={textHeaderImage()}
        image="DeleteUser"
        textFooterImage={textFooterImage()}
        type={0}
        btnText={I18n.t('userDeleteTitleButton')}
        onPress={onPress}
        showButton
      />
    );
  }

  renderUserTabs = SceneMap({
    1: () => this.renderTabUserData(),
    2: () => this.renderTabPermission(),
    3: () => this.renderTabSales('sale'),
    4: () => this.renderTabSales('order'),
  });

  renderLoader() {
    return <LoadingCleanScreen />;
  }

  renderRightButtons() {
    const { navigation, saleHasFilter, orderHasFilter, route } = this.props;
    const { index, havePermissionSave } = this.state;
    const { params = {} } = route;
    const { user } = params;

    let rightButtons = [];
    if (!havePermissionSave) {
      rightButtons = [
        ...rightButtons,
        { icon: 'trash', color: colors.primaryBg, onPress: () => this.deleteUser(), iconSize: 18 },
      ];
    }

    const salesType = index === 2 ? 'sale' : 'order';
    const navigateTo = () => {
      const customClearFilters = () => {
        if (index === 3) return this.props.ordersSetFilter([user], 'users');
        this.props.salesSetFilter([user], 'users');
      };
      navigation.navigate('SalesPeriod', { salesType, customClearFilters });
    };

    const hasFilter = salesType === 'sale' ? saleHasFilter : orderHasFilter;
    const filterButton = {
      icon: 'filter',
      color: hasFilter ? colors.actionColor : colors.primaryBg,
      onPress: () => navigateTo(),
      iconSize: 18,
    };
    if (index === 2 || index === 3) {
      rightButtons = [...rightButtons, filterButton];
    }

    return rightButtons;
  }

  allowEdit() {
    const { userLimit } = this.state;
    const { auth, route, billing } = this.props;

    const verifyPlan = (plan) => {
      return (
        auth.multiUsers.length >
        userLimit.PROUserLimit.innerFeatures.find((i) => i.plan === plan).limit
      );
    };

    if (auth.user.uid === route.params.user.uid) {
      return false;
    } else if (
      (isFree(billing) && verifyPlan(PLAN_FREE)) ||
      (isPro(billing) && verifyPlan(PLAN_PRO)) ||
      (isGrow(billing) && verifyPlan(PLAN_GROW)) ||
      (isPrime(billing) && verifyPlan(PLAN_PRIME))
    ) {
      return true;
    }
  }

  render() {
    const { navigation } = this.props;
    const { outerContainer } = scaffolding;
    const { innerSection } = styles;
    const { index, onPressTip, havePermissionSave } = this.state;
    const { visible } = this.props.loader;

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          headerTitle={I18n.t('userEditTitle')}
          rightButtons={this.renderRightButtons()}
          goBack={() => this.props.cleanUserForm().then(() => navigation.goBack())}
          navigate={navigation.navigate}
          navigation={navigation}
        />
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          {this.allowEdit() && (
            <KyteBox
              position="absolute"
              top={63}
              w="100%"
              h="100%"
              bg="#ffffff"
              zIndex={1}
              opacity={0.5}
            />
          )}
          <View style={[innerSection, { paddingTop: 15 }]}>
            <TabView
              initialLayout={initialLayout}
              navigationState={this.state}
              renderScene={this.renderUserTabs}
              renderTabBar={this.renderHeader}
              onIndexChange={this.onRequestChangeTab}
              lazy
            />
          </View>
          {index === 2 || index === 3 || havePermissionSave ? null : this.renderSaveButton()}
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
          <View style={{ flex: 1 }}>{this.renderTip(onPressTip)}</View>
        </KyteModal>
        {visible ? this.renderLoader() : null}
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  innerSection: {
    flex: 1,
  },
  spaceBottom: {
    marginBottom: 10,
  },
  totalSales: {
    height: 70,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: colors.secondaryBg,
    paddingHorizontal: 15,
  },
  total: {
    flex: 1,
  },
  totalBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    height: 60,
    marginTop: 10,
  },
  infoStyle: {
    fontFamily: 'Graphik-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: colors.primaryColor,
    ...Platform.select({
      ios: { lineHeight: SMALL_SCREENS ? 18 : 22 },
      android: { lineHeight: SMALL_SCREENS ? 18 : 25 },
    }),
  },
};

const mapStateToProps = (state) => ({
  filterSales: state.sales.filterSales,
  filterOrders: state.sales.filterOrders,
  loader: state.common.loader,
  initialValues: state.user.detail,
  isOnline: state.common.isOnline,
  saleHasFilter: hasFilters(state.sales.filterSales),
  orderHasFilter: hasFilters(state.sales.filterOrders),
  billing: state.billing,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      editUser,
      deleteUser,
      cleanUserForm,
      salesSetFilter,
      ordersSetFilter,
      salesClearFilter,
      ordersClearFilter,
    },
    dispatch,
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserEdit);
