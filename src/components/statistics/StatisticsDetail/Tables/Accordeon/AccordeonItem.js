import React, { Component } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { colors } from '../../../../../styles';

class AccordeonItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isChildrenVisible: false,
    };
  }

  changeChildrenVisibility() {
    const { isChildrenVisible } = this.state;
    const { callbackPress } = this.props;
    this.setState({ isChildrenVisible: !isChildrenVisible });

    if (callbackPress) {
      callbackPress();
    }
  }

  render() {
    const { accordeonHeader, accordeonChildren, style: componentStyle, iconContainerStyle, iconColor } = this.props;
    const { isChildrenVisible } = this.state;
    const { mainContainer, headerContainer, buttonContainer, iconContainer } = styles;

    return (
      <View style={[mainContainer, componentStyle]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => this.changeChildrenVisibility()} style={buttonContainer}>
          <View style={headerContainer}>
            {accordeonHeader}
          </View>
          <View style={[iconContainer, iconContainerStyle]}>
            <Icon
              name={isChildrenVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              color={iconColor || colors.primaryDarker}
              size={16}
              containerStyle={{ width: 15 }}
            />
          </View>
        </TouchableOpacity>
        {isChildrenVisible ? accordeonChildren : null}
      </View>

    );
  }
}

const styles = {
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flex: 0.95,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  iconContainer: {
    flex: 0.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export { AccordeonItem };
