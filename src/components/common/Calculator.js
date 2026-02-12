import React, { Component } from 'react';
import { View } from 'react-native';
import _ from 'lodash';
import { CalculatorButton, CalculatorRow, KyteIcon } from './';
import { incrementNumberToValue, decrementNumberToValue, generateTestID } from '../../util';
import { colors } from '../../styles';

class Calculator extends Component {
  constructor(props) {
    super(props);

    this.state = { rows: _.chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3) };
  }

  addValuePress(number) {
    const {
      stateValue,
      stateProp,
      state,
      valueType,
      valuePrecision,
      onPressNumber,
      getPressedNumber,
      disablePress,
    } = this.props;
    if (!disablePress) {
      state.setState(
        { [stateProp]: incrementNumberToValue(stateValue, number, valueType, valuePrecision) }
      );
    }
    if (onPressNumber) {
      onPressNumber(incrementNumberToValue(stateValue, number, valueType, valuePrecision));
    }
    if (getPressedNumber) getPressedNumber(number);
  }

  backPress() {
    const {
      stateValue,
      stateProp,
      state,
      valueType,
      valuePrecision,
      onPressNumber,
      backPressAction,
    } = this.props;
    state.setState({ [stateProp]: decrementNumberToValue(stateValue, valueType, valuePrecision) });
    if (onPressNumber) onPressNumber(decrementNumberToValue(stateValue, valueType, valuePrecision));
    if (backPressAction) backPressAction();
  }

  renderNumbers(array) {
    const { disablePress } = this.props;
    return array.map((number) => (
      <CalculatorButton
        disablePress={disablePress}
        buttonColor={this.buttonColor}
        key={number}
        onPress={() => this.addValuePress(number)}
        testProps={generateTestID(`dial-${number}`)}
      >
        {number}
      </CalculatorButton>
    ));
  }

  renderRows() {
    return this.state.rows.map((rowArr, i) => (
      <CalculatorRow key={i}>{this.renderNumbers(rowArr)}</CalculatorRow>
    ));
  }

  renderResetButton() {
    const { noBackpress } = this.props;
    if (noBackpress) return null;
    return (
      <CalculatorButton
        buttonIcon
        onPress={() => this.backPress()}
        testProps={generateTestID('dial-backspace')}
      >
        <KyteIcon name="calculator-reset" color={colors.primaryColor} size={30} />
      </CalculatorButton>
    );
  }

  renderConfirmButton() {
    const { stateValue, confirmIcon, onPressConfirm } = this.props;
    const confirmColor = this.props.disabled ? colors.errorColor : colors.actionColor;

    return (
      <CalculatorButton
        buttonIcon
        onPress={onPressConfirm}
        disabled={stateValue <= 0 || this.props.disabled}
        testProps={generateTestID('dial-confirmation')}
      >
        <KyteIcon
          name={confirmIcon}
          color={stateValue <= 0 ? colors.lighterColor : confirmColor}
          size={18}
        />
      </CalculatorButton>
    );
  }

  renderValueSwitcher() {
    const { isPositive, onPressValueSwitcher } = this.props;
    const valueColor = isPositive ? colors.errorColor : colors.primaryColor;
    const iconName = isPositive ? 'minus-cart' : 'plus-cart';

    return (
      <CalculatorButton buttonIcon onPress={onPressValueSwitcher}>
        <KyteIcon name={iconName} color={valueColor} size={18} />
      </CalculatorButton>
    );
  }

  render() {
    const { noConfirm, valueSwitcher, isPositive = true, disablePress } = this.props;
    this.buttonColor = { color: isPositive ? colors.primaryColor : colors.errorColor };

    return (
      <View style={{ flex: 1 }}>
        {this.renderRows()}
        <CalculatorRow>
          {noConfirm ? null : this.renderResetButton()}
          {noConfirm && !valueSwitcher ? <CalculatorButton /> : null}
          {valueSwitcher ? this.renderValueSwitcher() : null}
          <CalculatorButton
            disablePress={disablePress}
            buttonColor={this.buttonColor}
            onPress={() => this.addValuePress(0)}
            testProps={generateTestID('dial-0')}
          >
            0
          </CalculatorButton>
          {noConfirm ? this.renderResetButton() : this.renderConfirmButton()}
        </CalculatorRow>
      </View>
    );
  }
}

export { Calculator };
