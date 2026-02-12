import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { View, Text, Alert } from 'react-native'
import { productManagementSetValue } from '../../../stores/actions'
import { DetailPage, Calculator, ActionButton } from '../../common'
import HeaderButton from '../../common/HeaderButton'
import { scaffolding, colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { buildProductManaging, formatStockFractioned, isDecimal } from '../../../util'
import { variantManagementSetValue } from '../../../stores/variants/actions/product-variant.actions'
import { checkIsVariant } from '../../../util/products/util-variants'

class CurrentStockManager extends Component {
	constructor(props) {
		super(props)
		const { productManaging } = this.props
		const { currentStock, isFractioned } = productManaging
		const stockInitialValue = isFractioned ? '0.000' : 0

		this.state = {
			rows: _.chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3),
			actualStock: currentStock,
			stateStock: stockInitialValue,
			touched: false,
		}
	}

	setCurrentStock() {
		const { stateStock, touched } = this.state
		const { fromBarcodeReader, callback, navigation } = this.props
		if (touched) this.productManagementSetValue(stateStock || 0, 'currentStock')
		if (fromBarcodeReader) {
			callback()
			return
		}
		navigation.goBack()
	}

	setActualStock(value) {
		this.setState({ actualStock: value })
	}

	touchedCalculator() {
		this.setState({ touched: true })
	}

	entryValue() {
		const { stateStock } = this.state
		const { currency } = this.props
		const { initialStock } = this.props.productManaging
		const { entryContainer, entryStyle } = styles
		const stockInsertUpperCase = I18n.t('stockHistoricalFilter.insert').toUpperCase()
		const stockDeductUpperCase = I18n.t('stockHistoricalFilter.deduct').toUpperCase()
		const stockDiff = Math.abs(Number(initialStock - stateStock))
		const entryText = Number(stateStock) < Number(initialStock) ? stockDeductUpperCase : stockInsertUpperCase

		const renderEntry = () => (
			<View style={entryContainer}>
				<Text style={entryStyle('Graphik-Regular')}>{`${entryText}: `}</Text>
				<Text style={entryStyle('Graphik-Medium')}>
					{isDecimal(stockDiff)
						? formatStockFractioned(stockDiff, currency.decimalSeparator, currency.groupingSeparator)
						: stockDiff}
				</Text>
			</View>
		)
		return stockDiff ? renderEntry() : null
	}

	productManagementSetValue(...params) {
		const { product } = this.props
		const isVariant = checkIsVariant(product)
		const setValue = isVariant ? this.props.variantManagementSetValue : this.props?.productManagementSetValue

		setValue(...params)
	}

	renderHelpIcon() {
		return (
			<HeaderButton
				onPress={() =>
					Alert.alert(I18n.t('stockFractionedTip.title'), I18n.t('stockFractionedTip.message'), [
						{ text: I18n.t('alertOk') },
					])
				}
				buttonKyteIcon
				icon={'help-filled'}
				size={20}
				color={colors.grayBlue}
			/>
		)
	}

	render() {
		const { productManaging, currency, fromBarcodeReader, callback, navigation } = this.props
		const { stateStock, actualStock, touched } = this.state
		const { bottomContainer } = scaffolding
		const { stockContainer, stockNumber, numberContainer } = styles

		const renderValue = (value) => {
			return productManaging.isFractioned
				? formatStockFractioned(value, currency.decimalSeparator, currency.groupingSeparator)
				: Number(value)
		}

		// Switch number color
		let color = colors.actionColor
		if (Number(actualStock) <= 0 && !touched) {
			color = colors.errorColor
		} else if (productManaging.minimumStock && Number(actualStock) < Number(productManaging.minimumStock) && !touched) {
			color = colors.warningColor
		}

		return (
			<DetailPage
				goBack={fromBarcodeReader ? () => callback() : () => navigation.goBack()}
				pageTitle={I18n.t('stockCurrentTitle')}
				rightComponent={productManaging.isFractioned ? this.renderHelpIcon() : null}
			>
				<View style={stockContainer}>
					<View style={numberContainer}>
						<Text style={stockNumber(color)}>{renderValue(touched ? stateStock : actualStock)}</Text>
					</View>
					{touched ? this.entryValue() : null}
				</View>
				<View style={{ flex: 1.3 }}>
					<Calculator
						state={this}
						stateProp={'stateStock'}
						valueType={productManaging.isFractioned ? 'decimal' : false}
						stateValue={stateStock}
						onPressNumber={() => this.touchedCalculator()}
						valuePrecision={productManaging.isFractioned ? 3 : false}
						noConfirm
					/>
				</View>
				<View style={bottomContainer}>
					<ActionButton onPress={() => this.setCurrentStock()}>OK</ActionButton>
				</View>
			</DetailPage>
		)
	}
}

const styles = {
	stockContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.lightBg,
	},
	stockNumber: (color) => ({
		color,
		fontFamily: 'Graphik-Light',
		fontSize: 70,
	}),
	numberContainer: {
		flexDirection: 'column',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: colors.primaryColor,
	},
	entryContainer: {
		flexDirection: 'row',
		marginTop: 20,
	},
	entryStyle: (fontFamily) => ({
		fontFamily,
		fontSize: 16,
		color: colors.primaryColor,
	}),
}

const mapStateToProps = ({ products, preference, variants }, ownProps) => {
	const { product } = ownProps?.route?.params ?? {}
	const { currency } = preference.account ?? {}
	const productManaging = product ? buildProductManaging(product, variants.productManaging) : products.productManaging

	return {
		productManaging,
		currency,
		product,
	}
}

// export default connect(mapStateToProps, { productManagementSetValue })(CurrentStockManager);
module.exports = connect(mapStateToProps, { productManagementSetValue, variantManagementSetValue })(CurrentStockManager)
