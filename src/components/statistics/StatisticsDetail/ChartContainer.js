import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { YAxis, XAxis } from 'react-native-svg-charts';
import { colors } from '../../../styles';
import I18n from '../../../i18n/i18n';

const yAxisSize = 60;

class ChartContainer extends Component {
  state = {
    yRender: true
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ yRender: nextProps.periodRange === this.props.periodRange });
  }

  renderYAxis() {
    const formatLabelY = (value) => {
      if (this.props.currency) {
        const valueToString = value.toString();
        const valueCharAt = (number) => valueToString.charAt(number);
        const rounded = (number) => valueCharAt(number) === '0';
        const decimalNumber = (number) => `.${valueCharAt(number)}`;
        const formatNumber = () => {
          let number = '';
          let lenght = 1;
          let text = I18n.t('words.s.thousand');

          if (value > 999999) {
            text = I18n.t('words.s.million');
            value = valueToString.substr(0, valueToString.length - 3);
          } else if (value > 999999999) {
            text = I18n.t('words.s.billion');
            value = valueToString.substr(0, valueToString.length - 6);
          }

          if (value > 9999 && value < 100000) {
            lenght = 2;
          } else if (value > 99999 && value < 1000000) {
            lenght = 3;
          }

          for (let i = 0; i < lenght; i++) {
            number += valueCharAt(i);
          }

          value = `${number}${!rounded(lenght) ? decimalNumber(lenght) : ''}${text}`;
        };
        if (value > 999) {
          formatNumber();
        }
        return `${this.props.currency || ''} ${value}`;
      }
      return value;
    };

    return (
      <YAxis
        data={this.state.yRender ? [...this.props.data, 0] : []}
        svg={chartStyles.yAxisSvg}
        style={{ width: yAxisSize, paddingBottom: 30 }}
        numberOfTicks={4}
        formatLabel={value => formatLabelY(value)}
        contentInset={chartStyles.yAxisInset}
        min={0}
      />
    );
  }

  render() {
    const formatLabelX = (index) => {
      return this.props.keys ? this.props.keys[index] : index;
    };

    return (
      <View style={chartStyles.outerContainer}>
        <View style={chartStyles.innerContainer}>
          {this.renderYAxis()}
          <View style={{ flex: 1 }}>
            {this.props.children}
            <XAxis
              data={this.props.data}
              numberOfTicks={this.props.numberOfTicks}
              style={{ height: 20, marginTop: 10, marginLeft: 20 }}
              formatLabel={(value, index) => formatLabelX(index)}
              contentInset={this.props.xAxisInset || chartStyles.xAxisInset}
              svg={chartStyles.xAxisSvg}
            />
          </View>
        </View>
      </View>
      );
  }
}

const chartStyles = {
  outerContainer: { height: 220 },
  innerContainer: { flex: 1, flexDirection: 'row' },
  bottomContainer: { marginTop: 15 },
  yAxisInset: { top: 6, bottom: 5 },
  xAxisInset: { left: 15, right: 5 },
  yAxisSvg: { fontSize: 12, fill: colors.grayBlue, width: yAxisSize, /*x: yAxisSize,*/ fontFamily: 'Graphik-Regular', /*textAnchor: 'end'*/ },
  xAxisSvg: { fontSize: 12, fill: colors.grayBlue, fontFamily: 'Graphik-Regular', y: 2 }
};

const mapStateToProps = ({ statistics }) => ({
  periodRange: statistics.filter.periodRange,
});

export default connect(mapStateToProps)(ChartContainer);
