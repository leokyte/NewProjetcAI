import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { KyteIcon, KyteText, TextButton, KyteProLabel } from '../common';
import { OrderStatus } from '../../enums';
import { colors } from '../../styles';
// import NavigationService from '../../services/kyte-navigation';
import I18n from '../../i18n/i18n';
import { capitalizeFirstLetter, setOrderIcon } from '../../util';

const StatusListOptions = (props) => {
  const { statusList, disableCustomStatus, status } = props;
  const isActive = (s) => s.status === status[0] || (!status.length && !s.status);
  const activeStatusList = statusList.filter(s => s.active);
  const showProTag = (s) => !s.isFree && disableCustomStatus;

  // Styles
  const statusItem = { height: 50, paddingHorizontal: 15, marginHorizontal: 10, marginBottom: 5, flexDirection: 'row', alignItems: 'center', borderColor: colors.actionColor };
  const disabledStyle = { opacity: 0.3 };
  const activeStatus = { borderWidth: 2 };
  const statusText = { flex: 1, paddingHorizontal: 15, alignSelf: 'center' };
  const iconPositioning = { position: 'relative', top: -1 };
  const paid = OrderStatus.items[OrderStatus.PAID].status;
  const awaitingPayment = OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status;
  const dollarSign = (s) => s === paid || s === awaitingPayment;

  return (
    <ScrollView>
      {activeStatusList.map((s, i) => (
        <TouchableOpacity
          disabled={s.disabled || isActive(s)}
          key={i}
          onPress={() => props.setOrder(s.status)}
          style={[statusItem, isActive(s) ? activeStatus : null, s.disabled ? disabledStyle : null]}
        >
          <KyteIcon
            style={Platform.OS === 'ios' ? iconPositioning : null}
            size={dollarSign(s.status) ? 18 : 14}
            name={setOrderIcon(s.status)}
            color={s.color}
          />
            <KyteText size={14} style={statusText}>
              {capitalizeFirstLetter(s.alias)}
            </KyteText>
            {showProTag(s) ? <KyteProLabel /> : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const StatusList = (props) => {
  const navigation = useNavigation();
  const listContainer = { maxHeight: 400 };
  const tipContainer = { paddingHorizontal: 15, paddingBottom: 15 };
  const textStyle = { lineHeight: 18 };
  const textButtonStyle = { textAlign: 'center' };

  const goToOrderStatus = () => {
    const { setStatusList = false } = props;
    props.toggleModal();

    navigation.navigate('CatalogOrderStatus', { setStatusList });
  };

  const renderTip = () => (
    <View style={tipContainer}>
      <KyteText style={textStyle} pallete={'grayBlue'} size={13}>{I18n.t('selectStatusInfo')}</KyteText>
    </View>
  );

  const renderManageBtn = () => (
    <View style={tipContainer}>
      <TextButton
        style={textButtonStyle}
        onPress={goToOrderStatus}
        title={I18n.t('manageStatus')}
        color={colors.actionColor}
        size={16}
      />
    </View>
  );

  return (
    <View>
      {!props.hideInfo ? renderTip() : null}
      <View style={listContainer}>
        <StatusListOptions
          setOrder={props.setOrder}
          statusList={props.statusList}
          status={props.status}
          disableCustomStatus={props.disableCustomStatus}
        />
      </View>
      {!props.hideManageBtn ? renderManageBtn() : null}
    </View>
  );
};

export default StatusList;
