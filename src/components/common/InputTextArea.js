import React, { Component } from 'react';
import { View, TextInput, Text } from 'react-native';
import { formStyle, colors } from '../../styles';
import { generateTestID, isIphoneX } from '../../util';

class InputTextArea extends Component {
  state = {
    isFocused: false,
  };

  inputFocus(onFocus) {
    this.setState({ isFocused: true });
    if (onFocus) onFocus();
  }

  inputBlur(onBlur) {
    this.setState({ isFocused: false });
    if (onBlur) onBlur();
  }

  renderBorder() {
    if (this.props.noBorder) {
      return 'transparent';
    }
    if (this.props.error) {
      return colors.errorColor;
    }
    return this.state.isFocused ? colors.actionColor : colors.primaryGrey;
  }

  renderError() {
    const { errorStyle } = formStyle;
    return <Text style={errorStyle}>{this.props.error}</Text>;
  }

  renderInput() {
    const { inputStyle } = formStyle;
    const { displayIosBorder, style, testID } = this.props;
    const { isFocused } = this.state;
    const shrinkSection = this.props.shrinkSection

    return (
      <View style={{ flex: 1 }}>
        <View
          style={
            isIphoneX()
              ? { flex: 1, marginBottom: shrinkSection ? 85 : shrinkSection ?? 45 }
              : {
                  flex: 1,
                  marginBottom: shrinkSection ? 20 : 0,
                }
          }
        >
          <TextInput
            style={[
              inputStyle,
              style,
              {
                paddingHorizontal: 20,
                alignContent: 'flex-start',
              },
              displayIosBorder || displayIosBorder === undefined
                ? {
                    borderBottomWidth: this.state.isFocused ? 2 : 1,
                    borderBottomColor: this.renderBorder(),
                  }
                : {},
            ]}
            onChangeText={this.props.onChangeText}
            onFocus={() => this.inputFocus(this.props.onFocus)}
            onBlur={() => this.inputBlur(this.props.onBlur)}
            value={
              this.props.substring
                ? this.props.value.substring(this.props.substring[0], this.props.substring[1])
                : this.props.value
            }
            autoCorrect={this.props.autoCorrect || false}
            placeholder={!isFocused || this.props.hideLabel ? this.props.placeholder : null}
            secureTextEntry={this.props.secureTextEntry}
            keyboardType={this.props.keyboardType}
            maxLength={this.props.maxLength}
            placeholderTextColor={this.props.placeholderColor || colors.grayBlue}
            editable={this.props.editable}
            autoFocus={this.props.autoFocus}
            multiline={this.props.multiline}
            numberOfLines={this.props.numberOfLines}
            returnKeyType={this.props.returnKeyType}
            ref={this.props.inputRef}
            autoCapitalize={this.props.autoCapitalize}
            pointerEvents={this.props.pointerEvents}
            textAlignVertical={this.props.textAlignVertical}
            {...(testID ? generateTestID(testID) : {})}
          />
        </View>
      </View>
    );
  }

  renderInputLabel() {
    const { inputLabel } = formStyle;
    return <Text style={inputLabel}>{this.props.placeholder}</Text>;
  }

  renderInputContainer() {
    const { inputContainerStyle, labelContainer } = formStyle;
    const { isFocused } = this.state;
    const showLabel = isFocused || this.props.value;
    const renderLabel = () => {
      return <View style={labelContainer}>{showLabel ? this.renderInputLabel() : null}</View>;
    };

    return (
      <View style={[inputContainerStyle, this.props.flex ? { flex: 1 } : '']}>
        {this.props.hideLabel ? null : renderLabel()}
        {this.renderInput()}
        {this.props.error ? this.renderError() : null}
      </View>
    );
  }

  render() {
    return this.renderInputContainer();
  }
}

export { InputTextArea };
