import React from 'react';
import { connect } from 'react-redux';
import { Input } from ".";
import { currencyFormat } from '../../util';

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const InputCurrency = (props) => {
  const {
    placeholder,
    placeholderColor,
    onChangeText,
    value,
    currency,
    decimalCurrency,
    testProps,
  } = props;

  const extractNumber = (formatedValue) => {
    const matchedNumbers = formatedValue.match(/(\d+)/g);
    const rawNumber = matchedNumbers ? matchedNumbers.join('') : '';
    const newValue = decimalCurrency ? parseFloat(rawNumber.splice(rawNumber.length - 2, 0, '.')) : parseInt(rawNumber);
    return onChangeText(newValue);
  };

  return (
    <Input
      placeholder={placeholder}
      placeholderColor={placeholderColor}
      onChangeText={extractNumber}
      value={currencyFormat(value || 0, currency, decimalCurrency)}
      testProps={testProps}
    />
  );
};

export default connect(({ preference }) => ({
  currency: preference.account.currency,
  decimalCurrency: preference.account.decimalCurrency,
}))(InputCurrency);
