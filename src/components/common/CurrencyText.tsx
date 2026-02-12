import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { isCurrencySymbolAtLeft, formatCurrencyValue } from '../../util'
import { KyteText } from './KyteText'
import { currencyStyles } from '../../styles'
import { ICurrency } from '@kyteapp/kyte-utils'

interface RootState {
	preference: {
		account: {
			currency: ICurrency
			decimalCurrency: boolean
		}
	}
}

interface OwnProps {
	style?: TextStyle
	containerStyle?: ViewStyle
	currencyColor?: string
	numberColor?: string
	numberStyle?: TextStyle
	value?: number
	testProps?: any
	useBalanceSymbol?: number
	isSplitted?: boolean
}

const mapStateToProps = (state: RootState) => ({
	currency: state.preference.account.currency,
	decimalCurrency: state.preference.account.decimalCurrency,
})

const connector = connect(mapStateToProps)
type Props = OwnProps & ReturnType<typeof mapStateToProps>

class CurrencyTextComponent extends Component<Props> {
	generateBalanceSymbol(n: string | number): string {
		const { useBalanceSymbol } = this.props
		const alreadyHasSymbol = /(?:(?:\+))|(?:(?:\-))/.test(String(n))
		if (!useBalanceSymbol || alreadyHasSymbol) return String(n)
		return useBalanceSymbol < 0 ? `-${n}` : `+${n}`
	}

	renderSplittedValue() {
		const {
			style: textStyle,
			containerStyle,
			currencyColor,
			numberColor,
			currency,
			decimalCurrency,
			numberStyle,
			value = 0,
			testProps,
		} = this.props
		const { currencySymbol } = currency

		const valueFormatted = formatCurrencyValue(Math.abs(value), currency, decimalCurrency, true)
		const currencySymbolAtLeft = isCurrencySymbolAtLeft(value, currency)
		const numberStyleProp = numberStyle || currencyStyles.currencyNumberStyle(valueFormatted.length, numberColor)
		const currencyStyle = currencyStyles.currencyTextStyle(currencyColor)

		return (
			<View style={[styles.container, containerStyle]}>
				<KyteText
					style={[textStyle, !currencySymbolAtLeft ? numberStyleProp : currencyStyle]}
					pallete={null}
					lineThrough={false}
					{...this.props}
				>
					{!currencySymbolAtLeft
						? this.generateBalanceSymbol(valueFormatted)
						: this.generateBalanceSymbol(currencySymbol)}
				</KyteText>
				<KyteText
					style={[textStyle, !currencySymbolAtLeft ? currencyStyle : numberStyleProp]}
					testProps={testProps}
					pallete={null}
					lineThrough={false}
					{...this.props}
				>
					{' '}
					{!currencySymbolAtLeft ? currencySymbol : valueFormatted}
				</KyteText>
			</View>
		)
	}

	renderDefaultValue() {
		const { style, value, currency, decimalCurrency, testProps } = this.props
		const valueFormatted = formatCurrencyValue(value, currency, decimalCurrency)
		return (
			<Text allowFontScaling={false} style={style} {...testProps}>
				{this.generateBalanceSymbol(valueFormatted)}
			</Text>
		)
	}

	render() {
		const { isSplitted } = this.props
		return isSplitted ? this.renderSplittedValue() : this.renderDefaultValue()
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
})

export const CurrencyText = connector(CurrencyTextComponent)
