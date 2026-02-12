import React from 'react';
import { View, Text, Animated } from 'react-native';
import { KyteIcon } from './';
import I18n from '../../i18n/i18n';
import { colors } from '../../styles';

const OrderTransition = (props) => (
  <View style={s.transitionContainer}>
    <Animated.View style={[s.clockContainer, { opacity: props.confirmedOpacity }]}>
      <KyteIcon name={'clock-thin'} size={148} color={colors.actionColor} />
      <Text style={s.transitionText}>{I18n.t('confirmedOrderLabel')}</Text>
    </Animated.View>
    <Animated.View style={[s.clockContainer, { opacity: props.openedOpacity }]}>
      <KyteIcon name={'clock-stroke'} size={148} color={colors.primaryColor} />
      <Text style={s.transitionText}>{I18n.t('openedOrderPendingLabel')}</Text>
    </Animated.View>
  </View>
);

const s = {
  transitionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  transitionText: {
    fontFamily: 'Graphik-Semibold',
    fontSize: 22,
    color: colors.primaryColor,
    marginTop: 15,
  },
  clockContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
};

export { OrderTransition };
