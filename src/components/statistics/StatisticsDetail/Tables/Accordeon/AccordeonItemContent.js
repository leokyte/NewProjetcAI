import React from 'react';
import { Dimensions } from 'react-native';

import { CurrencyText, KyteTableRow, KyteTd, KyteText } from '../../../../common';
import { accordeonStyles, colors } from '../../../../../styles';
import { currencyValueFormatter } from '../../../../../util';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const FONT_SIZE = SMALL_SCREENS ? 10 : 12;

const AccordeonItemContent = (props) => {
  const {
    item,
    rowStyle,
    columnStyle,
    currency,
    circleColor,
  } = props;

  const { text, count, total, avg } = item;
  const { alignEnd, alignCenter, fixPadding } = accordeonStyles;

  return (
    <KyteTableRow style={rowStyle}>
      <KyteTd width={3.43} colorCircle={circleColor} style={[fixPadding, columnStyle, { paddingLeft: 15, paddingRight: 0 }]}>
        <KyteText size={FONT_SIZE} pallete="grayBlue">{text}</KyteText>
      </KyteTd>
      <KyteTd width={1} style={[alignCenter, fixPadding, columnStyle]} >
        <KyteText size={FONT_SIZE} pallete="grayBlue">{count}</KyteText>
      </KyteTd>
      <KyteTd width={2.2} style={[alignEnd, fixPadding, columnStyle]} >
        <KyteText size={FONT_SIZE}>
          <CurrencyText style={{ color: colors.grayBlue }} value={total} />
        </KyteText>
      </KyteTd>
      <KyteTd width={1} style={[alignEnd, fixPadding, columnStyle]}>
        <KyteText size={FONT_SIZE} pallete="grayBlue">
          {currencyValueFormatter(!!avg ? avg.toFixed(1) : 0, currency, true).replace('.00', '')}%
        </KyteText>
      </KyteTd>
      <KyteTd width={0.4} style={[fixPadding, columnStyle]} />
    </KyteTableRow>
  );
};

export { AccordeonItemContent };
