import { Dimensions } from 'react-native';
import { colors } from './colors';
import { smallScreenWidthBreak } from '../util';

const tabStyle = {
  base: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    elevation: 0
  },
  baseStatistic: {
    backgroundColor: '#FFF',
    borderBottomWidth: 0,
    elevation: 4
  },
  tab: {
    backgroundColor: 'transparent',
    opacity: 1,
  },
  label: {
    fontFamily: 'Graphik-Medium',
    fontSize: Dimensions.get('window').width > smallScreenWidthBreak ? 14 : 11
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 20,
    paddingBottom: 3,
    paddingHorizontal: 5
  },
  disabledColor: '#afb8c5',
  unfocusedColor: colors.primaryColor,
  activeColor: colors.actionColor,
  indicator: {
    backgroundColor: colors.actionColor,
    height: 3
  },
  customLabel: (color, fontSize) => {
    return {
      fontFamily: 'Graphik-Medium',
      fontSize: fontSize || 14,
      color
    };
  }
};

export { tabStyle };
