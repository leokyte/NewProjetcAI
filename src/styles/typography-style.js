import { Dimensions, Platform, PixelRatio } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const SMALL_SCREENS_WIDTH = SCREEN_WIDTH <= 320;

const Type = {
  Thin: {
    fontFamily: 'Graphik-Thin'
  },
  Light: {
    fontFamily: 'Graphik-Light'
  },
  ExtraLight: {
    fontFamily: 'Graphik-Extralight'
  },
  Regular: {
    fontFamily: 'Graphik-Regular'
  },
  Medium: {
    fontFamily: 'Graphik-Medium'
  },
  SemiBold: {
    fontFamily: 'Graphik-Semibold'
  },
  Bold: {
    fontFamily: 'Graphik-Bold'
  },
  fontReSize: (size) => {
    return {
      fontSize: SMALL_SCREENS ? size + (size * 0.10) : size + (size * 0.20),
    };
  },
  fontSize: (size) => {
    return {
      fontSize: size
    };
  },
  fontSizeNormalize: (size) => {
      if (!SMALL_SCREENS_WIDTH) return { fontSize: size };

      const scale = SCREEN_WIDTH / 320;
      const newSize = size * scale;

      if (Platform.OS === 'ios') {
        return { fontSize: Math.round(PixelRatio.roundToNearestPixel(newSize)) };
      }
      return { fontSize: Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2 };
  },
  fontSizeResize: (size) => {
    const scale = Dimensions.get('window').scale;
    return {
      fontSize: ((size / 2.0375) * scale)
    };
  },
  SizeXs: {
    fontSize: 12
  },
  SizeSm: {
    fontSize: 14
  },
  SizeMd: {
    fontSize: 16
  },
  SizeLg: {
    fontSize: 28
  },
  SizeXlg: {
    fontSize: 40
  },

  ColorLight: {
    color: '#fff'
  }
};

export { Type };
