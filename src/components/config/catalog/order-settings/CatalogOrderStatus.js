import React, { Component } from 'react';
import { Platform, TouchableOpacity, View, ScrollView } from 'react-native';
import { change, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import _ from 'lodash';

import { KyteSwitch } from '@kyteapp/kyte-ui-components';
import { DetailPage, KyteIcon, KyteText, LoadingCleanScreen, ActionButton } from '../../../common';
import { colors } from '../../../../styles';
import I18n from '../../../../i18n/i18n';
import { OrderStatus } from '../../../../enums';
import { preferenceSaveSaleStatus } from '../../../../stores/actions';
import NavigationService from '../../../../services/kyte-navigation';

const Strings = {
  PAGE_TITLE: I18n.t('orderStatus'),
  PENDING_STATUS_SUBTITLE: I18n.t('pendingStatusInfo'),
  CONFIRMED_STATUS_SUBTITLE: I18n.t('confirmedStatusInfo'),
  PAID_STATUS_SUBTITLE: I18n.t('paidStatusInfo'),
  ADD_NEW_STATUS_LABEL: I18n.t('addNewStatus'),
  INFORMATION_MSG: I18n.t('createStatusInfo'),
};

const opened = OrderStatus.items[OrderStatus.OPENED].status;
const confirmed = OrderStatus.items[OrderStatus.CONFIRMED].status;
const paid = OrderStatus.items[OrderStatus.PAID].status;

const defaultOrderStatus = OrderStatus.items
  .filter((o) => o.status === opened || o.status === confirmed || o.status === paid)
  .map((o) => {
    if (o.key === OrderStatus.OPENED) return { ...o, subtitle: Strings.PENDING_STATUS_SUBTITLE };
    if (o.key === OrderStatus.CONFIRMED) {
      return { ...o, subtitle: Strings.CONFIRMED_STATUS_SUBTITLE };
    }
    if (o.key === OrderStatus.PAID) return { ...o, subtitle: Strings.PAID_STATUS_SUBTITLE };
    return o;
  });

class CatalogOrderStatus extends Component {
  goToEditOrderStatus(item) {
    if (item.status === opened || item.status === confirmed || item.status === paid) return;
    NavigationService.navigate('OnlineCatalog', 'CatalogOrderStatusAdd', { action: 'edit', item });
  }

  toggleOrderStatus(item) {
    const { orderStatus } = this.props;
    const newStatus = orderStatus;

    const itemIndex = _.findIndex(newStatus, (o) => o.status === item.status);
    newStatus[itemIndex] = { ...newStatus[itemIndex], active: !item.active };
    this.props.preferenceSaveSaleStatus(newStatus, 'edit');
  }

  goBackAction() {
    const { route, navigation } = this.props;
    const { params = {} } = route;
    const { setStatusList } = params;

    if (setStatusList) setStatusList();
    navigation.goBack();
  }

  renderLoading() {
    return <LoadingCleanScreen />;
  }

  renderStatusList() {
    const { orderStatus } = this.props;
    const allStatus = [...defaultOrderStatus, ...orderStatus];

    const Capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const iconName = (statusName) => {
      if (statusName === opened) return 'clock-stroke-small';
      if (statusName === paid) return 'dollar-sign';
      return 'clock-small';
    };

    const renderStatusItem = (item, index) => {
      const isDeactivatable =
        item.status !== opened && item.status !== confirmed && item.status !== paid;
      return (
        <>
          <TouchableOpacity
            key={Math.random(100)}
            onPress={() => this.goToEditOrderStatus(item)}
            style={styles.statusItem(!!item.subtitle)}
          >
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <KyteIcon
                style={Platform.OS === 'ios' ? styles.iconPositioning : { top: 4 }}
                size={item.status === paid ? 18 : 14}
                name={iconName(item.status)}
                color={item.color}
              />
              <View>
                <KyteText size={15} weight="Semibold" style={styles.statusText}>
                  {Capitalize(item.alias)}
                </KyteText>
                {item.subtitle ? renderStatusSubtitle(item.subtitle) : null}
              </View>
            </View>
            {isDeactivatable ? renderSwitch(item) : null}
          </TouchableOpacity>
          {index + 1 < allStatus.length ? renderSeparator() : null}
        </>
      );
    };
    const renderStatusSubtitle = (subtitle) => (
      <KyteText size={12} style={[styles.statusText, styles.subtitle]}>
        {subtitle}
      </KyteText>
    );
    const renderSeparator = () => <View style={styles.separator} />;
    const renderSwitch = (item) => (
      <KyteSwitch
        onValueChange={() => this.toggleOrderStatus(item)}
        active={item.active}
      />
    );

    return <ScrollView>{allStatus.map((o, index) => renderStatusItem(o, index))}</ScrollView>;
  }

  render() {
    const { isLoaderVisible } = this.props;
    return (
      <DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => this.goBackAction()}>
        <ScrollView style={styles.container}>
          <View style={styles.listContainer}>{this.renderStatusList()}</View>
          <TouchableOpacity
            onPress={() =>
              NavigationService.navigate('OnlineCatalog', 'CatalogOrderStatusAdd', {
                action: 'add',
              })
            }
            style={styles.addStatusButton}
          >
            <KyteText
              size={16}
              weight="Semibold"
              pallete="actionColor"
              style={[styles.statusText, { flex: 2, alignItems: 'flex-start' }]}
            >
              {Strings.ADD_NEW_STATUS_LABEL}
            </KyteText>

            <View style={styles.addButtonContainer}>
              <KyteIcon
                style={Platform.OS === 'ios' ? styles.iconPositioning : null}
                size={20}
                name="plus-cart"
                color={colors.actionColor}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <KyteText pallete="primaryBg" size={14} style={{ lineHeight: 16, padding: 15 }}>
              {Strings.INFORMATION_MSG}
            </KyteText>
          </View>
        </ScrollView>
        <ActionButton
          style={{ marginBottom: 10 }}
          onPress={() => this.goBackAction()}
          alertTitle={I18n.t('words.s.attention')}
          alertDescription={I18n.t('enterAllfields')}
        >
          OK
        </ActionButton>
        {isLoaderVisible ? this.renderLoading() : null}
      </DetailPage>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  statusItem: (hasSubtitle) => ({
    height: hasSubtitle ? 80 : 55,
    marginVertical: hasSubtitle ? 5 : 0,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.actionColor,
  }),
  statusText: {
    paddingHorizontal: 15,
  },
  iconPositioning: {
    position: 'relative',
    top: -1,
  },
  subtitle: {
    paddingTop: 5,
    lineHeight: 16,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderlight,
  },
  addStatusButton: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderlight,
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    paddingHorizontal: 10,
  },
  infoContainer: {
    backgroundColor: colors.lightBg,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 5,
  },
  addButtonContainer: {
    flex: 0.5,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
};

const CatalogOrderStatusForm = reduxForm({
  form: 'CatalogOrderStatusForm',
})(CatalogOrderStatus);

export default connect(
  ({ preference, common }) => ({
    orderStatus: preference.account.salesStatus,
    isLoaderVisible: common.loader.visible,
  }),
  { change, preferenceSaveSaleStatus },
)(CatalogOrderStatusForm);
