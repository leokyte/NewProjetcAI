import { Dimensions } from 'react-native';
import { colors } from './colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const labelContainerDefaults = (backgroundColor) => {
  return {
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  };
};

const gridItemDefaults = {
  margin: 4,
  height: SMALL_SCREENS ? 100 : 120,
  borderRadius: 4,
};

const animationContainer = {
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
};

const addItemBg = '#f7f7f8';
const addItemColor = '#b5bfcf';
const labelFont = 'Graphik-Semibold';
const labelColor = '#FFF';

// ProductsListView

const lineStyles = {
  itemContainer: {
    height: 70,
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  labelContainer: {
    width: 70,
    height: 50,
    marginRight: 15,
    borderRadius: 4,
  },
  addItem(backgroundColor) {
    return {
      backgroundColor: backgroundColor || addItemBg,
      justifyContent: 'center',
      alignItems: 'center'
    };
  },
  addItemIcon(color) {
    return {
      size: 28,
      color: color || addItemColor
    };
  },
  priceContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  labelStyle: {
    fontSize: 15,
    fontFamily: labelFont,
    color: labelColor
  },
  nameStyle: {
    fontFamily: 'Graphik-Medium',
    fontSize: 14,
    flex: 2,
    color: colors.secondaryBg,
    paddingRight: 10
  },
  priceStyle: {
    fontFamily: 'Graphik-Regular',
    color: colors.secondaryBg,
    fontSize: 14,
  },
  oldPriceStyle: {
    textDecorationLine: 'line-through',
    color: colors.grayBlue,
    lineHeight: 16,
    fontSize: 11,
  },
  placeHolderText: {
    fontFamily: 'Graphik-Light',
    color: colors.secondaryColor,
  },
  flexImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
};

// ProductsGridView

const gridStyles = {
  itemContainer: {
    width: '33.33%',
    position: 'relative',
  },
  itemStyles: (backgroundColor) => {
    return {
      backgroundColor
    };
  },
  addItem(backgroundColor) {
    return {
      backgroundColor: backgroundColor || addItemBg,
      justifyContent: 'center',
      alignItems: 'center'
    };
  },
  addItemIcon(color) {
    return {
      size: 58,
      color: color || addItemColor
    };
  },
  labelContainer: {
    flex: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  },
  descriptionContainer: (height) => ({
    height,
    paddingHorizontal: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  }),
  labelStyle: {
    fontSize: (SMALL_SCREENS) ? 20 : 22,
    fontFamily: labelFont,
    color: labelColor
  },
  nameStyle: {
    fontFamily: 'Graphik-Medium',
    fontSize: 13,
    color: '#FFF',
  },
  priceStyle: {
    fontFamily: 'Graphik-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#FFF',
  },
  oldPriceStyle: {
    textDecorationLine: 'line-through',
    color: '#FFF',
    opacity: 0.7,
    fontSize: 11,
  },
  flexImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4
  },
};

const productListTileStyle = {
  paddingTop: 16,
  paddingBottom: 16,
  borderBottomWidth: 1,
  borderColor: colors.borderColor,
}

export { lineStyles, gridStyles, labelContainerDefaults, gridItemDefaults, animationContainer, productListTileStyle };
