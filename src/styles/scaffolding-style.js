import { Dimensions, Platform } from 'react-native';
import { colors } from './colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const scaffolding = {
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  subBarDefaults: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        alignItems: 'center',
        height: (SMALL_SCREENS) ? 45 : 55
      },
      android: {
        height: 55
      }
    }),
  },
  subHeader: {
    backgroundColor: '#FFF',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  subHeaderButton: (width) => ({
    width: width || 55,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        height: (SMALL_SCREENS) ? 45 : 55
      },
      android: {
        height: 55,
      }
    }),
  }),
  searchBarContainer: {
    paddingLeft: 8,
    alignItems: 'center',
    backgroundColor: colors.lightBg,
  },
  searchBar: {
    height: 60
  },
  bottomContainer: {
    height: 70,
    justifyContent: 'center'
  },
  textLg: {
    fontSize: 20
  },
  pageVertical: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  pageVerticalItem: {
    justifyContent: 'center',
  },
  verticalItemTitle: {
    color: colors.primaryColor,
    fontFamily: 'Graphik-Medium',
    textAlign: 'center',
    fontSize: 16,
  },
  flexImage: {
    height: 250,
    flex: 1,
    width: null
  },
  disabled: {
    opacity: 0.4
  },
  textAlignCenter: {
    textAlign: 'center'
  }
};

export { scaffolding };
