import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { KyteIcon } from '../common';
import { colors, Type, colorSet } from '../../styles';
import I18n from '../../i18n/i18n';

class StatisticsPanel extends Component {
    renderTitle() {
      const { panelTitle } = this.props;
      const title = typeof I18n.t(panelTitle) === 'string' ? I18n.t(panelTitle) : I18n.t(panelTitle).title;

      return (
        <Text style={[Type.Medium, colorSet(colors.secondaryBg), Type.fontSize(14)]}>
          {title}
        </Text>
      );
    }

    renderValue() {
      const { panelValue } = this.props;
      return (
        <Text style={[Type.Regular, colorSet(colors.actionColor), Type.fontSize(24)]} ellipsizeMode='tail' numberOfLines={1}>
          {panelValue}
        </Text>
      );
    }

    renderChart() {
      const { children } = this.props;

      return (
        <View style={styles.chartContainer}>
            {children}
        </View>
      );
    }

    renderSubtitle() {
      const { panelSubtitle, panelSubtitleMoney } = this.props;
      return (
        <View style={styles.subtitleContainer}>
          <Text style={[Type.Regular, Type.fontSize(14), { color: colors.secondaryBg }]}>
            {panelSubtitle}{panelSubtitleMoney || ''}
          </Text>
        </View>
      );
    }

    renderIcon() {
      return (
        <KyteIcon
            name={'back-navigation'}
            color={colors.primaryBg}
            size={11}
            style={{ transform: [{ rotate: '180deg' }] }}
        />
      );
    }

    render() {
        const { statisticsPanelContainer } = styles;
        const { children } = this.props;

        return (
          <TouchableOpacity onPress={this.props.onPress} activeOpacity={0.8}>
            <View style={statisticsPanelContainer}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ marginBottom: 5 }}>{this.renderTitle()}</View>
                        <View>{this.renderValue()}</View>
                    </View>
                </View>
                {children ? this.renderChart() : null}
              </View>
              <View style={{ flexDirection: 'row', paddingTop: 5 }}>
                {this.renderSubtitle()}
                {this.renderIcon()}
              </View>
            </View>
          </TouchableOpacity>
        );
    }
}

const styles = {
  statisticsPanelContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderColor: colors.borderDarker,
    borderBottomWidth: 1,
  },
  subtitleContainer: {
    justifyContent: 'flex-start',
    flex: 1
  },
  chartContainer: {
    justifyContent: 'center',
    flex: 0.5,
  },
};

export default StatisticsPanel;
