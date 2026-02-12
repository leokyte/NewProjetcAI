import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { KyteIcon, KyteText, CurrencyText } from '../../common';
import { colors } from '../../../styles';
import I18n from '../../../i18n/i18n';

const PaymentItem = (props) => {
  const { itemContainer, itemContent, iconStyle, newBadge, topSpace } = styles;
  const { actionColor, primaryColor } = colors;
  const normalSize = '33.3%';
  const largeSize = '66.7%';
  const iconWithFill = props.isSelected ? `${props.icon}-fill` : props.icon;
  const isCustomerAccount = props.type && props.type === 6;

  const renderNew = () => (
    <View style={newBadge(props.isSelected)}>
      <KyteText color="white" size={10} weight="Semibold">{I18n.t('words.s.new').toUpperCase()}</KyteText>
    </View>
  );

  const renderCustomerBalance = () => (
    <KyteText style={topSpace} pallete={props.customer.accountBalance > 0 ? 'actionColor' : 'primaryColor'} size={13} weight="Medium">
      <CurrencyText value={props.customer.accountBalance} />
    </KyteText>
  );

  return (
    <TouchableOpacity
      style={[itemContainer(props.doubleSized ? largeSize : normalSize), props.disabled ? styles.disabled : null]}
      onPress={props.onPress}
      disabled={props.disabled}
      activeOpacity={0.8}
      {...props.testProps}
      >
      <View style={itemContent}>
        {props.new ? renderNew() : null}
        <KyteIcon
          style={iconStyle}
          size={26}
          name={!props.noFill ? iconWithFill : props.icon}
          color={props.isSelected ? actionColor : primaryColor}
        />
        <KyteText pallete={props.isSelected ? 'actionColor' : 'primaryColor'} size={13} weight="Medium">
          {props.description}
        </KyteText>
        {props.customer && isCustomerAccount ? renderCustomerBalance() : null}
      </View>
    </TouchableOpacity>
  );
};

const height = 100;
const styles = {
  itemContainer: (width) => ({
    width,
    height,
  }),
  iconStyle: { marginBottom: 10 },
  itemContent: {
    height,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.borderColor,
  },
  disabled: { opacity: 0.2 },
  newBadge: (isSelected) => ({
    position: 'absolute',
    left: 5,
    top: 5,
    backgroundColor: isSelected ? colors.actionColor : colors.primaryColor,
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 7,
  }),
  topSpace: { marginTop: 5 },
};

export default PaymentItem;
