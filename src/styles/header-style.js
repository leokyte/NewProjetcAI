import { Platform, Dimensions } from 'react-native';
import { colors } from './colors';

const headerStyles = {
  headerBase: (border, position = 'relative', backgroundColor = '#FFF', top = 0) => {
    return {
      backgroundColor,
      height: 60,
      padding: 0,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: border,
      borderColor: colors.borderDarker,
      position,
      top,
      right: 0,
      left: 0,
      zIndex: 20
    };
  },
  headerTransparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0
  },
  headerStyle: {
    height: 60,
    elevation: 0,
  },
  headerTitleStyle: {
    color: colors.secondaryBg,
    fontFamily: 'Graphik-Medium',
    fontWeight: (Platform.OS === 'ios') ? '500' : '400',
    fontSize: (Platform.OS === 'ios' && Dimensions.get('window').height <= 568) ? 17 : 18
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export { headerStyles };
