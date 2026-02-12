import React, { Component } from 'react';
import { View, TextInput, Text, Platform, TouchableOpacity } from 'react-native';
import { formStyle, colors } from '../../styles';
import { generateTestID } from '../../util';

class Input extends Component {
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

    return (
      <Text
        style={errorStyle}
        {...(this.props.error.includes('email')
          ? generateTestID('email-req-ca')
          : this.props.error.includes('nam')
          ? generateTestID('name-req-ca')
          : generateTestID('password-req-ca'))}
      >
        {this.props.error}
      </Text>
    );
  }

  renderWithoutFocus() {
    const { focusAction, displayIosBorder, style } = this.props;
    const { inputStyle } = formStyle;
    const { isFocused } = this.state;
    return (
      <TouchableOpacity onPress={focusAction} activeOpacity={0.8} style={{ flex: 1 }}>
        <View pointerEvents="none">
          <TextInput
            style={[
              inputStyle,
              style,
              this.props.rightIcon && !this.props.rightIconStyle ? { paddingRight: 50 } : null,
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
            placeholderTextColor={this.props.placeholderColor || colors.secondaryBg}
            editable={this.props.editable}
            autoFocus={this.props.autoFocus}
            multiline={this.props.multiline}
            numberOfLines={this.props.numberOfLines}
            returnKeyType={this.props.returnKeyType}
            ref={this.props.inputRef}
            autoCapitalize={this.props.autoCapitalize}
            pointerEvents={this.props.pointerEvents}
            textAlignVertical={this.props.textAlignVertical}
            normalize={this.props.normalize}
            onSubmitEditing={this.props.onSubmitEditing}
            selectTextOnFocus={this.props.selectTextOnFocus}
            contextMenuHidden={this.props.contextMenuHidden}
            onEndEditing={this.props.onEndEditing}
            {...this.props.testProps}
          />
        </View>
      </TouchableOpacity>
    );
  }

  renderInput() {
    const { inputStyle } = formStyle;
    const { displayIosBorder, style } = this.props;
    const { isFocused } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <TextInput
          style={[
            inputStyle,
            style,
            this.props.rightIcon && !this.props.rightIconStyle ? { paddingRight: 50 } : null,
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
          placeholderTextColor={this.props.placeholderColor || colors.secondaryBg}
          editable={this.props.editable}
          autoFocus={this.props.autoFocus}
          multiline={this.props.multiline}
          numberOfLines={this.props.numberOfLines}
          returnKeyType={this.props.returnKeyType}
          ref={this.props.inputRef}
          autoCapitalize={this.props.autoCapitalize}
          pointerEvents={this.props.pointerEvents}
          textAlignVertical={this.props.textAlignVertical}
          normalize={this.props.normalize}
          onSubmitEditing={this.props.onSubmitEditing}
          onEndEditing={this.props.onEndEditing}
          {...this.props.testProps}
        />
      </View>
    );
  }

  renderLeftIcon() {
    return (
      <View style={{ flex: 0.2, justifyContent: 'center', marginLeft: 10 }}>
        {this.props.leftIcon}
      </View>
    );
  }

  renderRightIcon() {
    const calcTop = () => {
      return Platform.OS === 'ios' ? 6 : 10;
    };

    const getStyle = () => {
      return this.props.rightIconStyle
        ? this.props.rightIconStyle
        : { position: 'absolute', top: calcTop(), right: 10 };
    };

    return <View style={getStyle()}>{this.props.rightIcon}</View>;
  }

  renderInputLabel() {
    const { inputLabel } = formStyle;
    return <Text style={inputLabel}>{this.props.placeholder}</Text>;
  }

  renderInputContainer() {
    const { inputContainerStyle, inputHolder, labelContainer } = formStyle;
    const { isFocused } = this.state;
    const showLabel = isFocused || this.props.value;
    const renderLabel = () => {
      return <View style={labelContainer}>{showLabel ? this.renderInputLabel() : null}</View>;
    };

    return (
      <View style={[inputContainerStyle, this.props.flex ? { flex: 1 } : '']}>
        {this.props.hideLabel ? null : renderLabel()}
        <View style={inputHolder(this.props.height || 45)}>
          {this.props.leftIcon ? this.renderLeftIcon() : null}
          {this.props.focusAction ? this.renderWithoutFocus() : this.renderInput()}
          {this.props.rightIcon ? this.renderRightIcon() : null}
        </View>
        {this.props.error ? this.renderError() : null}
      </View>
    );
  }

  render() {
    return this.renderInputContainer();
  }
}

export { Input };
