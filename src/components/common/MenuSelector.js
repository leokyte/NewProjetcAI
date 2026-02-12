import React from 'react';
import { TouchableOpacity, View, Switch } from 'react-native';
import { isFree, KyteSwitch } from '@kyteapp/kyte-ui-components';
import { KyteIcon, KyteText, KyteTagNew } from ".";
import { colors } from '../../styles';

class MenuSelector extends React.PureComponent {
  renderArrow() {
    return <KyteIcon name="arrow-cart" size={10} style={{ marginLeft: 20 }} />;
  }

  renderItemLabel() {
    const { label, subtitle, tagNew, billing } = this.props;
    const renderSubtitle = () =>
      subtitle ? (
        <KyteText size={11} pallete="primaryBg" marginTop={5}>
          {subtitle}
        </KyteText>
      ) : null;

    return (
      <View style={{ flex: 1 }}>
        {tagNew && !isFree(billing) && (
          <KyteTagNew style={{ position: 'absolute', right: 10, top: 1 }} />
        )}
        <KyteText pallete="primaryDarker" size={styles.labelTextSize} weight="Semibold">
          {label}
        </KyteText>
        {renderSubtitle()}
      </View>
    );
  }

  renderSwitchContainer() {
    const { switchActive } = this.props;
    return (
      <View pointerEvents="none">
        <KyteSwitch
          active={switchActive}
        />
      </View>
    );
  }

  render() {
    const { onClick, arrow, switchOption, extraItem, testProps } = this.props;
    return (
      <TouchableOpacity onPress={() => onClick()} style={styles.itemContainer} {...testProps}>
        {this.renderItemLabel()}
        {extraItem ? extraItem() : null}
        {arrow ? this.renderArrow() : null}
        {switchOption ? this.renderSwitchContainer() : null}
      </TouchableOpacity>
    );
  }
}

const styles = {
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderlight,
  },
  labelTextSize: 16,
};

export { MenuSelector };
