import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { CurrencyText, KyteText } from '../../common/index';
import { colors, Type } from '../../../styles/index';
import I18n from '../../../i18n/i18n';

const CustomerItemList = (props) => {
  const { customer, onPress, disableOptions = {} } = props;

  const renderAccountBalanceLabel = () => {
    const balanceInfo = customer.accountBalance > 0 ?
      { color: colors.actionColor, symbol: '+' } :
      { color: colors.errorColor, symbol: '-' };
    const currencyStyle = [Type.Medium, { color: balanceInfo.color }];
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <KyteText>{`${I18n.t('words.s.balance')}: `}</KyteText>
        <CurrencyText
          style={[currencyStyle, { fontSize: 13 }]}
          value={Math.abs(customer.accountBalance)}
          useBalanceSymbol={customer.accountBalance}
        />
      </View>
    );
  };

  const tagAccountBalance = customer.accountBalance !== 0;
  const lowerBalance = customer.accountBalance <= 0;
  const higherBalance = customer.accountBalance > 0;

  const { disableWithCredit, disableWithoutCredit } = disableOptions;
  const doDisable = disableWithCredit || disableWithoutCredit;
  const disableDebit = doDisable && lowerBalance && disableWithoutCredit;
  const disableCredit = doDisable && higherBalance && disableWithCredit;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.customerContainer}>
      <View style={[styles.customerNameContainer, (disableDebit || disableCredit) ? styles.disabled : null]}>
        <KyteText weight="Semibold" pallete="secondaryBg" {...props.testProps}>
          {customer.salesQuantity === 1 ? `🤑 ${customer.name}` : customer.name}
        </KyteText>
        {tagAccountBalance ? renderAccountBalanceLabel() : null}
      </View>
      <View style={styles.iconContainer}>
        <Icon
          name={'keyboard-arrow-right'}
          color={colors.secondaryColor}
          size={14}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  customerContainer: {
    height: 60,
    flexDirection: 'row',
    borderColor: colors.borderColor,
    borderBottomWidth: 1,
    padding: 15,

  },
  customerNameContainer: {
    flex: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
};

const mapStateToProps = ({ preference }) => ({ currency: preference.account.currency });
export default connect(mapStateToProps)(React.memo(CustomerItemList));
