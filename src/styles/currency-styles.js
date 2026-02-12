import { Type } from './typography-style';
import { textSizeFill } from '../util';
import { colorSet } from './colors';

const currencyStyles = {
  currencyNumberStyle: (length, color) => ([
    Type.Light,
    Type.fontSize(textSizeFill(length)),
    colorSet(color),
  ]),
  currencyTextStyle: (color) => ([
    Type.Regular,
    Type.fontSize(18),
    colorSet(color),
  ]),
};

export { currencyStyles };
