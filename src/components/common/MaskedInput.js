import React, { useState, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import { TextInputMask } from 'react-native-masked-text'
import { View, Text } from 'react-native'
import { formStyle, colors } from '../../styles'
import { convertMoneyToDecimalFixed } from '../../util'

const MaskedInputComponent = (props) => {
	const [isFocused, setIsFocused] = useState(false)
	const inputRef = useRef(null)

	const inputFocus = useCallback((onFocus) => {
		setIsFocused(true)
		if (onFocus) onFocus()
	}, [])

	const inputBlur = useCallback(
		(onBlur) => {
			setIsFocused(false)
			if (onBlur) onBlur()
			if (props.getRawValue) sendRawValue()
		},
		[props.getRawValue]
	)

	const sendRawValue = useCallback(() => {
		const rawValue = inputRef.current.getRawValue()
		props.onChangeText(rawValue)
	}, [props])

	const convertValue = useCallback(
		(value) => {
			const { currencySymbol } = props.currency
			if (props.type === 'money' && props.value) {
				return convertMoneyToDecimalFixed(value, currencySymbol)
			}
			return value
		},
		[props.currency, props.type, props.value]
	)

	const renderError = () => {
		const { errorStyle } = formStyle
		return <Text style={errorStyle}>{props.error}</Text>
	}

	const renderBorder = () => {
		if (props.noBorder) {
			return 'transparent'
		}
		if (props.error) {
			return colors.errorColor
		}
		return isFocused ? colors.actionColor : colors.primaryGrey
	}

	const renderInputLabel = () => {
		const { inputLabel } = formStyle
		return <Text style={inputLabel}>{props.placeholder}</Text>
	}

	const renderInputContainer = () => {
		const { inputContainerStyle, inputHolder, labelContainer } = formStyle
		const showLabel = isFocused || props.value
		const renderLabel = () => <View style={labelContainer}>{showLabel ? renderInputLabel() : null}</View>

		return (
			<View style={[inputContainerStyle, props.flex ? { flex: 1 } : '']}>
				{props.hideLabel ? null : renderLabel()}
				<View style={inputHolder(props.height || 45)}>{renderInput()}</View>
				{props.error ? renderError() : null}
			</View>
		)
	}

	const renderInput = () => {
		const { inputStyle } = formStyle
		const { currencySymbol, groupingSeparator, decimalSeparator } = props.currency
		const { decimalCurrency, isPercent, testProps } = props
		const unit = props.hideUnit ? '' : `${currencySymbol} `
		const value = props.noConvert || !decimalCurrency ? props.value : convertValue(props.value)

		const defaultPattern = {
			unit,
			separator: !decimalCurrency && !isPercent ? ' ' : decimalSeparator,
			delimiter: groupingSeparator,
			mask: props.mask,
			suffixUnit: props.suffixUnit,
			precision: !decimalCurrency && !isPercent ? 0 : 2,
		}

		return (
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
				<TextInputMask
					style={[
						inputStyle,
						props.style,
						{ borderBottomWidth: isFocused ? 2 : 1, borderBottomColor: renderBorder(), flex: 1 },
					]}
					onChangeText={sendRawValue}
					value={value}
					autoCorrect={false}
					placeholder={!isFocused || props.hideLabel ? props.placeholder : null}
					secureTextEntry={props.secureTextEntry}
					keyboardType={props.keyboardType}
					maxLength={props.maxLength}
					placeholderTextColor={props.placeholderColor || colors.secondaryBg}
					type={props.type}
					editable={props.editable}
					onFocus={() => inputFocus(props.onFocus)}
					onBlur={() => inputBlur(props.onBlur)}
					autoFocus={props.autoFocus}
					ref={inputRef}
					options={props.options || defaultPattern}
					returnKeyType={props.returnKeyType}
					checkText={props.checkText}
					{...testProps}
				/>
				{props.rightIcon ? (
					<View style={{ position: 'absolute', right: 0, paddingRight: 10 }}>{props.rightIcon}</View>
				) : null}
			</View>
		)
	}

	return renderInputContainer()
}

const mapStateToProps = ({ preference }) => ({
	currency: preference.account.currency,
	decimalCurrency: preference.account.decimalCurrency,
})

export const MaskedInput = connect(mapStateToProps)(MaskedInputComponent)
export default MaskedInput
