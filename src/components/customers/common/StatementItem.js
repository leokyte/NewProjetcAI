import React from 'react';
import moment from 'moment/min/moment-with-locales';
import { View, TouchableOpacity } from 'react-native';
import { KyteIcon, KyteText, CurrencyText } from '../../common';
import { CustomerAccountMovementReason } from '../../../enums';
import { colors } from '../../../styles';
import I18n from '../../../i18n/i18n';

const Strings = {
  BALANCE_LABEL: I18n.t('words.s.balance'),
  CANCELED_SALE: I18n.t('stockHistoricalFilter.canceledSale'),
  BY: I18n.t('words.s.by'),
};

const StatementItem = (props) => {
  const { statement } = props;
  const isCancelled = statement.isCancelled;
  const reason = CustomerAccountMovementReason.items[statement.reason.toUpperCase()];
  const isIn = statement.type === 'IN';
  const color = isIn ? colors.actionColor : colors.barcodeRed;
  const upperTextSize = props.share ? 13 : 15;
  const lowerTextSize = props.share ? 11 : 12;
  const lowerTextMargin = { marginTop: 5 };

  const renderInfo = () => {
    const style = {
      main: { flex: 1 },
    };

    const dateCreationDate = moment(statement.dateCreation).format('l');
    const dateCreationTime = moment(statement.dateCreation).format('LT');
    return (
      <View style={style.main}>
        <KyteText
          weight={'Semibold'}
          size={upperTextSize}
          pallete={'primaryDarker'}
          lineThrough={isCancelled}
        >
          {reason ? reason.title : ''}
        </KyteText>
        <KyteText size={lowerTextSize} pallete={'primaryBg'} style={lowerTextMargin}>
          {`#${statement.movementNumber} - ${dateCreationDate} ${dateCreationTime}`}
        </KyteText>
      </View>
    );
  };

  const renderCurrency = () => {
    const style = {
      main: { alignItems: 'flex-end' },
    };
    return (
      <View style={style.main}>
        <KyteText weight={'Medium'} size={upperTextSize} pallete={'primaryDarker'} lineThrough={isCancelled}>
          <CurrencyText value={statement.newCurrent} useBalanceSymbol={statement.newCurrent >= 0 ? false : -1}/>
        </KyteText>
        <KyteText size={lowerTextSize} style={[lowerTextMargin, { color }]} lineThrough={isCancelled}>
          <CurrencyText value={statement.value} useBalanceSymbol={isIn ? 1 : -1} />
        </KyteText>
      </View>
    );
  };

  const renderArrow = () => {
    const style = {
      main: { marginLeft: 10 },
    };

    return (
      <View style={style.main}>
        <KyteIcon
          name={isIn ? 'arrow-in' : 'arrow-out'}
          color={color}
          size={18}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.mainContainer(props.share)}
      disabled={!props.onPress}
      onPress={props.onPress}
    >
      {renderInfo()}
      {renderCurrency()}
      {renderArrow()}
    </TouchableOpacity>
  );
};

const styles = {
  mainContainer: (share = false ) => {
    return {
      flexDirection: 'row',
      paddingHorizontal: share ? 0 : 15,
      paddingVertical: share ? 5 : 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderlight,
    };
  },
};


export default StatementItem;
