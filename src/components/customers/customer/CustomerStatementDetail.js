import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View, Text, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import moment from 'moment/min/moment-with-locales';
import { TabView, SceneMap } from 'react-native-tab-view';

import {
  KyteSafeAreaView,
  KyteToolbar,
  Tag,
  KyteIcon,
  CurrencyText,
  KyteText,
  KyteModal,
  LoadingCleanScreen,
  ActionButton,
  KyteTabBar,
} from '../../common';
import DetailCustomer from '../../sales/sale-detail/DetailCustomer';
import { CustomerAccountMovementReason, PaymentType } from '../../../enums';
import { colors, tabStyle } from '../../../styles';
import I18n from '../../../i18n/i18n';
import {
  customerDetailUpdate,
  refreshCustomerStatements,
  customerAccountGetStatements,
  customerAccountCancelStatement,
  salesClear,
  salesClearFilter,
  ordersClearFilter
} from '../../../stores/actions';
import { showOfflineAlert } from '../../../util';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const initialLayout = { width: Dimensions.get('window').width };

class CustomerStatementDetail extends React.Component {
  constructor(props) {
    super(props);

    const { params = {} } = props.route;
    const { statement } = params;
    this.allowCancel = params.allowCancel && !statement.isCancelled;
    this.statement = statement;
    this.isIn = this.statement.type === 'IN';
    this.color = this.isIn ? colors.actionColor : colors.barcodeRed;
    this.reasonLabel = CustomerAccountMovementReason.items[this.statement.reason].title;

    const date = moment(this.statement.dateCreation).format('DD/MM/YY');
    const time = moment(this.statement.dateCreation).format('LT');

    this.state = {
      index: 0,
      routes: [
        { key: '1', title: I18n.t('words.p.details').toUpperCase() },
        { key: '2', title: I18n.t('words.s.customer').toUpperCase() },
      ],
      cancelLoading: false,
      showModalCancelConfirmation: false,
      statementTime: `${date} ${I18n.t('saleLabelConnectorTitle')} ${time}`,
    };
  }

  cancelStatement () {
    const { statement } = this;
    const { goBack } = this.props.navigation;

    this.setState({ showModalCancelConfirmation: false });
    this.setState({ cancelLoading: true });
    const cancelCb = () => {
      this.setState({ cancelLoading: false });
      goBack();
    };

    this.props.customerAccountCancelStatement(statement, cancelCb);
  }

  goToCustomer() {
    const { navigate } = this.props.navigation;
    this.props.salesClear();
    this.props.salesClearFilter();
    this.props.ordersClearFilter();

    navigate({ key: 'CustomerDetailStatement', name: 'CustomerDetail' });
  }

  renderIcon(size, name) {
    const { isIn, color } = this;
    return (
      <KyteIcon
        name={name}
        color={color}
        size={size}
        style={{ marginBottom: 7 }}
      />
    );
  }

  renderCustomer() {
    const { statement } = this;
    return (
      <Tag
        style={{ marginRight: 10 }}
        info={_.map(statement.customer.name.split(' '), _.upperFirst).join(' ')}
        color={colors.primaryColor}
        icon="customer"
        onPress={() => null}
      />
    );
  }

  renderHeader() {
    const { isIn, color, statement } = this;
    const paymentType = PaymentType.items[statement.paymentType];
    const paymentIcon =  paymentType ? paymentType.icon : (isIn ? 'arrow-in' : 'arrow-out');
    const paymentDescription = paymentType ? paymentType.description : this.reasonLabel;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerBlock}>
          {this.renderIcon(22, paymentIcon)}
          <KyteText style={{ color }} weight={'Light'} size={36}>
            <CurrencyText
              value={statement.value}
              useBalanceSymbol={isIn ? false : -1}
            />
          </KyteText>
        </View>
        <View style={[styles.headerBlock, { marginTop: 15 }]}>
          <KyteText pallete={'primaryBg'} weight={'Medium'} size={14}>{paymentDescription}</KyteText>
          <KyteText pallete={'grayBlue'} size={14}>
            {`#${statement.movementNumber} ${I18n.t('words.s.by')} ${statement.userName}`}
          </KyteText>
        </View>
      </View>
    );
  }

  renderObservation() {
    const { statement } = this;

    return (
        <View style={styles.observationContainer}>
          <View style={{ flex:1, alignItems: 'flex-end', marginRight: 10 }}>
            <KyteText size={14}>{statement.obs}</KyteText>
          </View>
          <View>
            <KyteIcon name={'observation'} color={colors.primaryDarker} size={15} />
          </View>
        </View>
    );
  }

  renderDetailsTab() {
    const { statement, isIn } = this;
    const size = 15;

    const renderPreviousBalance = () => (
      <View style={styles.detailsBlock}>
        <KyteText size={size}>{'Saldo anterior'}</KyteText>
        <KyteText
          pallete={statement.previous >= 0 ? 'actionColor' : 'barcodeRed'}
          weight={'Medium'}
          size={size}
        >
          <CurrencyText
            value={statement.previous}
            useBalanceSymbol={statement.previous}
          />
        </KyteText>
      </View>
    );

    const renderValue = () => (
      <View style={styles.detailsBlock}>
        <View style={{ flexDirection: 'row' }}>
          {this.renderIcon(18, isIn ? 'arrow-in' : 'arrow-out')}
          <KyteText size={size} style={{ marginLeft: 10 }}>{this.reasonLabel}</KyteText>
        </View>
        <KyteText
          pallete={isIn ? 'actionColor' : 'barcodeRed'}
          size={size}
          weight={'Medium'}
        >
          <CurrencyText
            value={statement.value}
            useBalanceSymbol={isIn ? 1 : -1}
          />
        </KyteText>
      </View>
    );

    const renderNewBalance = () => (
      <View style={styles.detailsBlock}>
        <KyteText weight={'Medium'} size={size + 1}>{I18n.t('customerAccount.newBalance')}</KyteText>
        <KyteText
          pallete={statement.newCurrent >= 0 ? 'actionColor' : 'barcodeRed'}
          weight={'Medium'}
          size={size + 1}
        >
          <CurrencyText
            value={statement.newCurrent}
            useBalanceSymbol={statement.newCurrent >= 0 ? 1 : -1}
          />
        </KyteText>
      </View>
    );

    return (
      <>
        <ScrollView>
          {renderPreviousBalance()}
          {renderValue()}
          {renderNewBalance()}
        </ScrollView>
        {this.renderCancelButton()}
      </>
    );
  }

  renderCustomerTab() {
    return (
      <DetailCustomer customer={this.props.customerDetail} goToCustomer={() => this.goToCustomer()} />
    );
  }

  renderTabs() {
    const renderTabBar = (props) => (
      <KyteTabBar
        labelTextStyle={{ fontSize: SMALL_SCREENS ? 11 : 13 }}
        tabStyle={tabStyle.tab}
        style={tabStyle.base}
        indicatorStyle={tabStyle.indicator}
        {...props}
      />
    );

    const scenes = {
      1: () => this.renderDetailsTab(),
      2: () => this.renderCustomerTab(),
    };

    const renderScenes = SceneMap(scenes);

    return (
      <View style={{ flex: 1, marginTop: 15 }}>
        <TabView
          initialLayout={initialLayout}
          navigationState={this.state}
          renderScene={renderScenes}
          renderTabBar={(props) => renderTabBar(props)}
          onIndexChange={(index) => this.setState({ index })}
        />
      </View>
    );
  }

  renderCancelButton() {
    const cancelNotAllowed = () => null;
    // const showModalCancelConfirmation = () => this.setState({ showModalCancelConfirmation: true });
    const showModalCancelConfirmation = () => {
      const { isOnline } = this.props;
      if (!isOnline) return showOfflineAlert();
      this.setState({ showModalCancelConfirmation: true });
    };

    return (
      <View style={{ paddingVertical: 15 }}>
        <ActionButton
          cancel
          onPress={this.allowCancel ? showModalCancelConfirmation : cancelNotAllowed}
          style={!this.allowCancel ? { opacity: 0.3 } : null}
          >
          <KyteText weight={'Medium'} pallete={'primaryDarker'} size={16}>
            {I18n.t('customerAccount.cancelTransaction')}
          </KyteText>
        </ActionButton>
      </View>
    );
  }

  renderModalCancelConfirmation() {
    const hideModal = () => this.setState({ showModalCancelConfirmation: false });
    return (
      <KyteModal
        isModalVisible
        hideModal={hideModal}
        height={'auto'}
      >
        <View>
          <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
             <TouchableOpacity
               onPress={hideModal}
               style={{ width: 24, height: 24, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lighterColor }}
             >
               <KyteIcon name={'close-navigation'} size={9} color={colors.primaryColor} />
             </TouchableOpacity>
          </View>
          <KyteText style={{ textAlign: 'center' }} pallete={'secondaryBg'} weight={'Medium'} size={18}>
            {I18n.t('customerAccount.cancelTransaction')}
          </KyteText>
          <KyteText style={{ textAlign: 'center', lineHeight: 18, paddingVertical: 20 }} size={14}>
            {I18n.t('customerAccount.cancelTransactionDescription')}
          </KyteText>
          <ActionButton onPress={() => this.cancelStatement()}>
            {I18n.t('customerAccount.cancelTransaction')}
          </ActionButton>
        </View>
      </KyteModal>
    );
  }

  render() {
    const { showModalCancelConfirmation, cancelLoading, statementTime } = this.state;
    const { statement } = this;

    return (
      <KyteSafeAreaView style={styles.safeAreaView}>
        <KyteToolbar
          innerPage
          headerTitle={statementTime}
          goBack={() => this.props.navigation.goBack()}
          rightComponent={this.renderCustomer()}
        />
        {this.renderHeader()}
        {statement.obs ? this.renderObservation() : null}
        {this.renderTabs()}
        {showModalCancelConfirmation ? this.renderModalCancelConfirmation() : null}
        {cancelLoading ? <LoadingCleanScreen /> : null}
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  safeAreaView: {
    height: '100%',
  },
  headerContainer: {
    backgroundColor: colors.lightBg,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  observationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBg,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1 ,
    borderTopColor: colors.disabledIcon,
  },
  detailsBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.lightBg,
  },
  cancelButtonDisabled: (allowCancel) => {
    return {
      opacity: allowCancel ? 0.8 : 0.4,
      borderWidth: 2,
      borderColor: allowCancel ? colors.primaryDarker : colors.disabledIcon,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 17,
    };
  },
};

const mapStateToProps = ({ customers, common }) => ({ customerDetail: customers.detail, isOnline: common.isOnline });
const mapDispatchToprops = (dispatch) => ({
  ...bindActionCreators({
    customerDetailUpdate,
    refreshCustomerStatements,
    customerAccountGetStatements,
    customerAccountCancelStatement,
    salesClear,
    salesClearFilter,
    ordersClearFilter,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToprops)(CustomerStatementDetail);
