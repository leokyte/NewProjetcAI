import { Platform } from 'react-native';
import { colors } from './colors';

const accordeonStyles = {
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
  iOSPaddingFix: Platform.select({
    ios: { paddingTop: 6 },
  }),
  fixPadding: {
    paddingHorizontal: 0,
  },
  grayBg: {
    backgroundColor: colors.lightBg,
  },
  detailingPadding: {
    paddingVertical: 5,
  },
  detailingPercentagePadding: {
    paddingHorizontal: 0,
  },
  fixAlign: {
    paddingRight: 5,
  },
  accordeonStyle: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  fixPaddingTh: {
    paddingHorizontal: 0,
    paddingRight: 0,
    paddingLeft: 0,
  },
  accordeonItemHeaderStyle: (color) => ({
    borderBottomWidth: 0,
    borderLeftWidth: 5,
    borderLeftColor: color,
    alignItems: 'center',
  }),
};
export { accordeonStyles };
