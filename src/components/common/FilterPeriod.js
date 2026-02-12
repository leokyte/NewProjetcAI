import React from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { colors, colorSet, Type, scaffolding } from '../../styles';
import { KyteProLabel } from './KyteProLabel';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SMALLEST_SCREENS = SCREEN_WIDTH <= 450;

const FilterPeriod = (props) => {
  const { periodFixedItem, periodsFixedContainer } = styles;

  const borderTopIndex = props.no30Days ? 2 : 1;
  const renderProLabel = () => <KyteProLabel />;

  const renderPeriodsFixed = () => {
    return props.periods.map((item, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => props.onPress(item.type, item.period, item.subtract)}
        activeOpacity={0.8}
        style={[
          props.style,
          { width: index < 1 && !props.no30Days ? '100%' : props.widthColumn || '50%' },
        ]}
      >
        <View
          style={[
            periodFixedItem, props.itemStyle,
            index < borderTopIndex ? { borderTopWidth: 1 } : null,
          ]}
        >
          <Text
            style={[
              props.selectedPeriod === item.period ? Type.Medium : Type.Regular,
              colorSet(
                props.selectedPeriod === item.period ? colors.actionColor : colors.primaryColor,
              ),
              Type.fontSize(14),
              props.titleStyle,
              { flex: 1 },
              props.notPro && item.premium ? scaffolding.disabled : null,
              index < 1 && !props.no30Days ? { textAlign: 'center' } : null
            ]}
          >
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return <View style={[periodsFixedContainer, props.containerStyle]}>{renderPeriodsFixed()}</View>;
};

const styles = {
  periodsFixedContainer: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
  periodFixedItem: {
    padding: SMALLEST_SCREENS ? 15 : 20,
    borderColor: colors.borderDarker,
    borderBottomWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    flexDirection: 'row',
  },
};

export { FilterPeriod };
