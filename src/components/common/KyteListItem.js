import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Icon } from 'react-native-elements';
import { CircleBadge } from './CircleBadge';
import { colors, Type } from '../../styles';

class KyteListItem extends PureComponent {
  renderLeftContent() {
    const { leftContent, badgeColor } = this.props;
    const { leftContainer } = styles;
    return (
      <View style={leftContainer}>
        <CircleBadge
          info={leftContent}
          backgroundColor={badgeColor || colors.secondaryBg}
          textColor="#FFFFFF"
          fontSize={Platform.select({ ios: 15, android: 15 })}
          size={Platform.select({ ios: 45, android: 45 })}
          style={{ paddingTop: 1 }}
        />
      </View>
    );
  }

  renderMainContent() {
    const { mainContainer } = styles;
    const renderTitle = () => {
      return (
        <View>
          <Text
            style={[
              Type.SemiBold,
              Type.fontReSize(13),
              { color: colors.secondaryBg, marginBottom: 1.5 },
            ]}
            numberOfLines={1}
          >
            {this.props.title}
          </Text>
        </View>
      );
    };

    const renderSubtitle = () => {
      return (
        <View>
          <Text
            style={[Type.Regular, Type.fontReSize(11), { color: colors.primaryBg, marginTop: 1.5 }]}
            numberOfLines={1}
          >
            {this.props.subtitle}
          </Text>
        </View>
      );
    };

    return (
      <View style={mainContainer}>
        {renderTitle()}
        {this.props.subtitle ? renderSubtitle() : null}
      </View>
    );
  }

  renderRightContent() {
    const { rightContainer, rightContentContainer, rightContentChevronContainer } = styles;
    const { rightContent, hideChevron, customComponent } = this.props;
    const renderRightContent = () => {
      if (!customComponent) {
        return (
          <View style={rightContentContainer}>
            <Text              
              style={[
                this.props.rightContentStyle.fontFamily || Type.Regular,
                Type.fontReSize(11),
                { color: this.props.rightContentStyle.color || colors.grayBlue },
              ]}
            >
              {this.props.rightContent}
            </Text>
          </View>
        );
      }
      return (<View style={rightContentContainer}>{customComponent}</View>);
    };
    const renderChevron = () => {
      return (
        <View
          style={[
            rightContentChevronContainer,
            {
              flex: this.props.rightContent ? 0.5 : 1,
              marginBottom: this.props.rightContent ? 7 : 0,
            },
          ]}
        >
          <Icon name="chevron-right" size={16} color={colors.primaryBg} />
        </View>
      );
    };
    return (
      <View style={[rightContainer, { flex: (rightContent && rightContent.length > 5) ? 0.4 : 0.2 }]}>
        {rightContent ? renderRightContent() : null}
        {!hideChevron ? renderChevron() : null}
      </View>
    );
  }

  render() {
    const { container } = styles;
    const { lastItem, active } = this.props;

    return (
      <TouchableOpacity
        style={[
          container,
          {
            borderBottomWidth: (lastItem) ? 1 : 0,
            borderBottomColor: colors.borderlight,
            opacity: active ? 1 : 0.5
          }
        ]}
        activeOpacity={0.9}
        onPress={() => this.props.onItemPress()}
      >
        {this.renderLeftContent()}
        {this.renderMainContent()}
        {this.renderRightContent()}
      </TouchableOpacity>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 17,
  },
  leftContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 0.8,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  rightContainer: {
    flex: 0.2,
  },
  rightContentContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 5,
    paddingRight: 5,
  },
  rightContentChevronContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
};

export { KyteListItem };
