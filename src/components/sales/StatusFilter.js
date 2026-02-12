import React from 'react';
import { View, ScrollView } from 'react-native';
import { CheckBoxOption } from '../common';
import { OrderStatus } from '../../enums';
import { setOrderIcon } from '../../util';

const paid = OrderStatus.items[OrderStatus.PAID].status;
const awaitingPayment = OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status;
const dollarSign = (s) => s === paid || s === awaitingPayment;
const listContainer = { maxHeight: 400 };

const StatusFilter = (props) => (
  <View style={listContainer}>
    <ScrollView>
      {props.statusList.map((s, i) => (
        <CheckBoxOption
          key={i}
          item={s.status}
          onPress={props.onPress}
          label={s.alias}
          iconsSize={16}
          icon={{ name: setOrderIcon(s.status), color: s.color, size: dollarSign(s.status) ? 20 : 16 }}
          active={props.selectedStatus.find(selected => s.status === selected) || (!props.selectedStatus.length && s.status === '')}
        />
      ))}
    </ScrollView>
  </View>
);

export default StatusFilter;
