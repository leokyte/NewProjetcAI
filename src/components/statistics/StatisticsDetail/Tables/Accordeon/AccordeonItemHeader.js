import React from 'react';
import { Dimensions } from 'react-native';

import { CurrencyText, KyteTableRow, KyteTd, KyteText } from '../../../../common';
import { currencyValueFormatter } from '../../../../../util';
import { accordeonStyles } from '../../../../../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const FONT_SIZE = SMALL_SCREENS ? 10 : 12;

const AccordeonItemHeader = (props) => {
  const {
    item,
    rowStyle,
    columnStyle,
    currency,
    circleColor,
    textColor,
  } = props;

  const { text, count, total, percent } = item;
  const { alignCenter, alignEnd, iOSPaddingFix, fixPadding } = accordeonStyles;

  return (
    <KyteTableRow style={rowStyle}>
      <KyteTd width={3.43} colorCircle={circleColor} style={[fixPadding, columnStyle, { paddingLeft: 15, paddingRight: 0 }]}>
        <KyteText size={FONT_SIZE} style={iOSPaddingFix} color={textColor}>{text}</KyteText>
      </KyteTd>
      <KyteTd width={1} style={[alignCenter, fixPadding, columnStyle]}>
        <KyteText size={FONT_SIZE} color={textColor}>{count}</KyteText>
      </KyteTd>
      <KyteTd width={2.2} style={[alignEnd, fixPadding, columnStyle]}>
        <KyteText weight="Medium" size={FONT_SIZE} color={textColor}>
          <CurrencyText value={total} />
        </KyteText>
      </KyteTd>
      <KyteTd width={1} style={[alignEnd, fixPadding, columnStyle]}>
        <KyteText size={FONT_SIZE} color={textColor}>
          {percent ? `${currencyValueFormatter(percent.toFixed(1), currency, true).replace('.00', '')}%` : null}
        </KyteText>
      </KyteTd>
    </KyteTableRow>
  );
};

export { AccordeonItemHeader };
