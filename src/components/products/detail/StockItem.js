import React from 'react';
import moment from 'moment/min/moment-with-locales';
import {View, Text, TouchableOpacity} from 'react-native';
import {KyteIcon} from '../../common';
import {colors, listStyles} from '../../../styles';
import {isDecimal, checkStockValueStatus} from '../../../util';
import I18n from '../../../i18n/i18n';

const StockItem = (props) => {
  const {textCenter, arrowStyle} = styles;
  const {itemContainer, cornerContainer, infoContainer, itemTitle, itemInfo} =
    listStyles;
  const {
    dateCreation,
    quantity,
    type,
    userName,
    newCurrent,
    minimum,
    idRef,
    reason,
    movementNumber,
  } = props.stock;
  const rotate = type === 'IN' ? '0deg' : '180deg';
  const arrowColor = type === 'IN' ? colors.actionColor : colors.errorColor;
  // const itemType = type === 'IN' ? I18n.t('stockHistoricalFilter.insert') : I18n.t('stockHistoricalFilter.deduct');
  let itemType = '';
  switch (reason) {
    case 'IN':
      itemType = I18n.t('stockHistoricalFilter.insert');
      break;
    case 'OUT':
      itemType = I18n.t('stockHistoricalFilter.deduct');
      break;
    case 'SALE':
      itemType = I18n.t('stockHistoricalFilter.sale');
      break;
    default:
      itemType = I18n.t('stockHistoricalFilter.canceledSale');
  }

  const stockStatus = checkStockValueStatus(newCurrent, {minimum});
  let valueColor = colors.primaryColor;
  if (stockStatus === 'error') valueColor = colors.errorColor;
  else if (stockStatus === 'warning') valueColor = colors.warningColor;

  const stockValue = isDecimal(newCurrent)
    ? newCurrent?.toFixed?.(3)
    : newCurrent;
  const quantityValue = isDecimal(quantity) ? quantity.toFixed(3) : quantity;
  const pressAction = () => {
    return reason === 'SALE' || !reason ? props.onPress(idRef) : null;
  };

  const fomartMovementNumber = () => {
    return movementNumber ? `#${movementNumber} - ` : '';
  };

  return (
    <TouchableOpacity
      onPress={() => pressAction()}
      style={itemContainer(20, colors.borderColor)}>
      <View style={cornerContainer(60)}>
        <KyteIcon
          color={arrowColor}
          style={arrowStyle(rotate)}
          name={'arrow-in'}
        />
      </View>
      <View style={infoContainer}>
        <Text style={itemTitle(colors.primaryColor)}>
          {itemType}: {quantityValue}
        </Text>
        <Text
          ellipsizeMode={'tail'}
          numberOfLines={1}
          style={itemInfo(colors.primaryColor)}>
          {`${fomartMovementNumber()}${moment(dateCreation).format(
            'l',
          )} ${moment(dateCreation).format('LT')} - ${userName}`}
        </Text>
      </View>
      <View style={cornerContainer(70)}>
        <Text style={[itemInfo(valueColor), textCenter]}>
          {I18n.t('stockItemBalance')}
        </Text>
        <Text style={[itemTitle(valueColor), textCenter]}>{stockValue}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  textCenter: {
    textAlign: 'center',
  },
  arrowStyle: (transform) => ({
    transform: [{rotate: transform}],
  }),
};

export default StockItem;
