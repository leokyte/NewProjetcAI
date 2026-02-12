import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View } from 'react-native';
import { checkPlanKeys } from '../../stores/actions';
import { colors } from '../../styles';
import { Features } from '../../enums';

const DEFAULT_TXT = 'default';

class F extends Component {
  constructor(props) {
    super(props);

    const stockKey = Features.items[Features.STOCK].key;
    this.checkStockKey(stockKey);

    this.state = {
      stockFeatureAllowed: false
    };
  }

  async checkStockKey(stockKey) {
    this.setState({ stockKeyAllowed: await this.props.checkPlanKeys(stockKey) });
  }

  render() {
    const { props } = this;
    const { stockKeyAllowed } = this.state;

    if (!stockKeyAllowed) return null;

    return (
      <View style={formatStyleBorderCircle(props.coreStyle)}>
        <View style={formatStyle(props.status, props.coreStyle)} />
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({ ...bindActionCreators({ checkPlanKeys }, dispatch) });
const StockCircle = connect(null, mapDispatchToProps)(F);

export { StockCircle };

const statusColorMap = {
  default: colors.primaryColor,
  error: colors.errorColor,
  warning: colors.warningColor,
};

const coreStyles = {
  mediumSize: {
    top: -2,
    right: -2,
    raio: 12,
    borderWidth: 8,
  },
  smallSize: {
    top: -1,
    right: -1,
    raio: 8,
    borderWidth: 6,
  },
  tabSize: {
    top: -5,
    right: -12,
    raio: 9,
    borderWidth: 0,
  },
};

const coreStylesMap = {
  default: coreStyles.smallSize,
  listItem: coreStyles.smallSize,
  gridItem: coreStyles.mediumSize,
  productItem: coreStyles.mediumSize,
  tabCircle: coreStyles.tabSize,
};

const formatStyle = (status = DEFAULT_TXT, coreStyle = DEFAULT_TXT) => {
  const backgroundColor = statusColorMap[status];
  const style = coreStylesMap[coreStyle];

  return {
    backgroundColor,
    borderRadius: 50,
    width: style.raio,
    height: style.raio,
  };
};

const formatStyleBorderCircle = (coreStyle = DEFAULT_TXT) => {
  const baseStyle = coreStylesMap[coreStyle];

  return {
    zIndex: 150,
    backgroundColor: 'white',
    position: 'absolute',
    top: baseStyle.top,
    right: baseStyle.right,

    borderRadius: 50,
    width: baseStyle.raio + baseStyle.borderWidth,
    height: baseStyle.raio + baseStyle.borderWidth,

    alignItems: 'center',
    justifyContent: 'center',
  };
};
