import React, { Component } from 'react'
import { View, Platform, Alert, ScrollView } from 'react-native'
import { KytePro, KyteSwitch } from '@kyteapp/kyte-ui-components'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { DetailPage, SwitchContainer, Input, MaskedInput, CheckList, ActionButton, ModalTax } from '../../common'
import { TaxType, TaxPercentFixedTypes, toList, Features } from '../../../enums'
import { colors, scaffolding } from '../../../styles'
import { taxesAccountSave, checkPlanKeys, checkFeatureIsAllowed, openModalWebview } from '../../../stores/actions'
import { logEvent } from '../../../integrations'
import I18n from '../../../i18n/i18n'
import { isFixedTax, generateDefaultPROFeatures, getPROFeature } from '../../../util'
import ConfigMenuItem from '../general/ConfigMenuItem'
import NavigationService from '../../../services/kyte-navigation'

class OrdersAndSalesComponent extends Component {
	constructor(props) {
		super(props)
		const tax = props.initialValues || {}

		this.state = {
			isTaxEnabled: tax.active || false,
			optionalTax: tax.optional || false,
			selectedTaxPercentFixedTypes: 0,
			taxPercentFixedTypes: [],
			selectedTaxType: 0,
			taxTypes: [],
			key: Features.items[Features.TAXES].key,
			remoteKey: Features.items[Features.TAXES].remoteKey,
			isTaxesAllowed: false,
			showModal: false,
			modalTypeTaxIndex: 0,
			PROSalesTax: generateDefaultPROFeatures('PROSalesTax'),
		}
	}

	async componentDidMount() {
		this.getPROFeatures()
	}

	async getPROFeatures() {
		const salesTax = await getPROFeature('PROSalesTax')
		salesTax &&
			this.setState({
				PROSalesTax: salesTax,
			})
	}

	UNSAFE_componentWillMount() {
		const tax = this.props.initialValues || {}
		const productTax = tax.type === 'product-tax'
		const fixedTax = isFixedTax(tax)

		this.setState({
			taxPercentFixedTypes: TaxPercentFixedTypes.items,
			selectedTaxPercentFixedTypes: fixedTax ? TaxPercentFixedTypes.FIXED_TAX : TaxPercentFixedTypes.PERCENT_TAX,

			taxTypes: toList(TaxType),
			selectedTaxType: productTax ? TaxType.PRODUCT_TAX : TaxType.SALE_TAX,
		})

		this.checkFeatureKey()
	}

	async checkFeatureKey() {
		const { key, isTaxEnabled } = this.state
		const isTaxesAllowed = await this.props.checkPlanKeys(key)
		this.setState({ isTaxesAllowed })
		this.setState({ isTaxEnabled: isTaxEnabled && isTaxesAllowed })
	}

	formSubmit({ name, percent, _id }) {
		const { isTaxEnabled, optionalTax, selectedTaxType, taxTypes, taxPercentFixedTypes, selectedTaxPercentFixedTypes } =
			this.state
		const { user, auth } = this.props
		const { goBack } = this.props.navigation

		const tax = {
			_id,
			name,
			percent,
			userName: user.displayName,
			aid: auth.aid,
			uid: user.uid,
			active: isTaxEnabled,
			optional: optionalTax,
			type: taxTypes[selectedTaxType].name,
			typePercentFixed: taxPercentFixedTypes[selectedTaxPercentFixedTypes].name,
		}

		if ((!name || !percent) && isTaxEnabled) {
			Alert.alert(I18n.t('words.s.attention'), I18n.t('enterAllfields'), [{ text: I18n.t('words.s.ok') }])
			return
		}

		if (this.props.isOnline) {
			this.props.taxesAccountSave(tax)
			logEvent('TaxesConfigured')
			goBack()
		} else {
			Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('customersOfflineWarningContent'))
		}
	}

	selectOption(option) {
		const { isTaxEnabled } = this.state

		if (!isTaxEnabled) {
			return
		}

		if (option === 1) {
			this.setState({ selectedTaxType: option, optionalTax: false })
			return
		}
		this.setState({ selectedTaxType: option })
	}

	turnTaxOn(value) {
		this.setState({ isTaxEnabled: value })
	}

	turnOptionalTax(value) {
		const { isTaxEnabled, selectedTaxType } = this.state
		if (isTaxEnabled && selectedTaxType !== 1) {
			this.setState({ optionalTax: value })
		}
	}

	renderField(field) {
		return (
			<Input
				{...field.input}
				onChangeText={field.input.onChange}
				onFocus={field.focusIn}
				onBlur={field.focusOut}
				placeholder={field.placeholder}
				keyboardType={field.kind}
				style={field.style}
				placeholderColor={field.placeholderColor}
				maxLength={field.maxLength}
				inputRef={field.inputRef}
				error={field.meta.touched ? field.meta.error : ''}
				hideLabel={field.hideLabel}
				returnKeyType="done"
				editable={field.editable}
				autoCorrect={field.autoCorrect}
			/>
		)
	}

	renderMaskedField = (field) => {
		const isPercentTax = field.selectedTaxPercentFixedTypes === TaxPercentFixedTypes.PERCENT_TAX
		const { decimalCurrency } = this.props.preference.account

		return (
			<MaskedInput
				{...field.input}
				onChangeText={field.input.onChange}
				onFocus={field.focusIn}
				onBlur={field.focusOut}
				placeholder={field.placeholder}
				keyboardType={field.kind}
				style={field.style}
				placeholderColor={field.placeholderColor}
				type={field.type}
				error={field.meta.touched ? field.meta.error : ''}
				returnKeyType="done"
				maxLength={field.maxLength}
				inputRef={field.inputRef}
				suffixUnit={isPercentTax ? '%' : false}
				editable={field.editable}
				noConvert
				hideUnit={isPercentTax}
				isPercent={decimalCurrency && false}
			/>
		)
	}

	renderTaxPercentFixedOptions() {
		const { selectedTaxPercentFixedTypes, taxPercentFixedTypes, isTaxEnabled, selectedTaxType } = this.state

		return (
			<CheckList
				onPress={(option) => {
					if (!isTaxEnabled) return
					this.setState({
						selectedTaxPercentFixedTypes: option,
						selectedTaxType: option === TaxPercentFixedTypes.FIXED_TAX ? TaxType.SALE_TAX : selectedTaxType,
					})
				}}
				selected={selectedTaxPercentFixedTypes}
				options={taxPercentFixedTypes}
				disabled={!isTaxEnabled}
			/>
		)
	}

	renderTaxOptions() {
		const { selectedTaxType, taxTypes, isTaxEnabled } = this.state
		const options = taxTypes.concat([])

		options[TaxType.SALE_TAX].tip = isTaxEnabled
		options[TaxType.PRODUCT_TAX].tip = isTaxEnabled

		options[TaxType.SALE_TAX].onPress = () => this.setState({ showModal: true, modalTypeTaxIndex: TaxType.SALE_TAX })
		options[TaxType.PRODUCT_TAX].onPress = () =>
			this.setState({ showModal: true, modalTypeTaxIndex: TaxType.PRODUCT_TAX })

		return (
			<CheckList
				onPress={this.selectOption.bind(this)}
				selected={selectedTaxType}
				options={options}
				disabled={!isTaxEnabled}
			/>
		)
	}

	renderTipModal() {
		const { modalTypeTaxIndex, taxTypes } = this.state
		const hideModal = () => this.setState({ showModal: false })

		return <ModalTax hideModal={() => hideModal()} taxType={taxTypes[modalTypeTaxIndex]} />
	}

	renderConfigStatus = () => {
		const statusMenu = {
			index: 0,
			type: 'order-status',
			label: I18n.t('orderStatus'),
			action: () => NavigationService.navigate(null, 'CatalogOrderStatus', { who: 'order-status' }),
		}
		return ConfigMenuItem(statusMenu, statusMenu.index)

		
	}

	render() {
		const { handleSubmit, billing } = this.props
		const { goBack, canGoBack } = this.props.navigation
		const {
			isTaxEnabled,
			optionalTax,
			isTaxesAllowed,
			key,
			remoteKey,
			showModal,
			selectedTaxPercentFixedTypes,
			selectedTaxType,
			PROSalesTax,
		} = this.state
		const { innerContainer, section, fieldContainer, pageBg } = styles
		const { bottomContainer } = scaffolding

		const handleGoBack = () => {
			if (canGoBack()) {
				goBack()
			} else {
				NavigationService.resetNavigation('Config')
			}
		}

		return (
			<DetailPage pageTitle={I18n.t('configMenus.ordersAndSales')} goBack={handleGoBack}>
				<View style={[innerContainer, pageBg]}>
					<ScrollView>
						<View style={innerContainer}>
							<View style={section}>
								{this.renderConfigStatus()}
								</View>
							<View style={section}>
								<KytePro
									billing={billing}
									feature={PROSalesTax}
									component={() => (
										<View>
											<SwitchContainer
												title={I18n.t('taxesActive')}
												onPress={() =>
													this.props.checkFeatureIsAllowed(key, () => this.turnTaxOn(!isTaxEnabled), remoteKey)
												}
												renderProBadge={!isTaxesAllowed}
											>
												<KyteSwitch
													onValueChange={(value) =>
														this.props.checkFeatureIsAllowed(key, () => this.turnTaxOn(value), remoteKey)
													}
													active={isTaxEnabled}
												/>
											</SwitchContainer>
										</View>
									)}
									onPressFree={() => {
										this.props.openModalWebview(PROSalesTax.infoURL)
									}}
									noTag
								/>
							</View>
							<View style={section}>{this.renderTaxPercentFixedOptions()}</View>

							<View style={section}>
								<View style={fieldContainer}>
									<Field
										placeholder={I18n.t('taxesNamePlaceholder')}
										placeholderColor={colors.primaryGrey}
										name="name"
										component={this.renderField}
										inputRef={(input) => {
											this.taxName = input
										}}
										style={[
											Platform.select({ ios: { height: 32 } }),
											{ color: !isTaxEnabled ? colors.lightBorder : colors.primaryDarker },
										]}
										editable={isTaxEnabled || false}
										autoCorrect
									/>
									<Field
										placeholder={I18n.t('taxesValuePlaceholder')}
										placeholderColor={colors.primaryGrey}
										kind="numeric"
										name="percent"
										type={'money'}
										component={this.renderMaskedField}
										inputRef={'value'}
										style={[
											Platform.select({ ios: { height: 32 } }),
											{ color: !isTaxEnabled ? colors.lightBorder : colors.primaryDarker },
										]}
										editable={isTaxEnabled || false}
										selectedTaxPercentFixedTypes={this.state.selectedTaxPercentFixedTypes}
									/>
								</View>
							</View>
							<View style={section}>
								{selectedTaxPercentFixedTypes === TaxPercentFixedTypes.PERCENT_TAX ? this.renderTaxOptions() : null}
							</View>
							<View style={[section, { opacity: selectedTaxType === 1 ? 0.4 : 1 }]}>
								<SwitchContainer
									title={I18n.t('taxesEnable')}
									description={I18n.t('taxesEnableDescription')}
									onPress={() => this.turnOptionalTax(!optionalTax)}
									disabled={!isTaxEnabled}
								>
									<KyteSwitch
										onValueChange={(value) => this.turnOptionalTax(value)}
										active={!isTaxEnabled ? false : optionalTax}
										disabled={!isTaxEnabled}
									/>
								</SwitchContainer>
							</View>
						</View>
						{showModal ? this.renderTipModal() : null}
					</ScrollView>
					<View style={[bottomContainer, pageBg]}>
						<ActionButton
							alertTitle={I18n.t('unsavedChangesTitle')}
							alertDescription={I18n.t('errorInField')}
							onPress={() => this.props.checkFeatureIsAllowed(key, handleSubmit(this.formSubmit.bind(this)), remoteKey)}
							cancel={!isTaxesAllowed}
						>
							{I18n.t('alertSave')}
						</ActionButton>
					</View>
				</View>
			</DetailPage>
		)
	}
}

const styles = {
	pageBg: {
		backgroundColor: colors.lightBg,
	},
	innerContainer: {
		flex: 1,
	},
	section: {
		backgroundColor: '#FFF',
		borderBottomWidth: 1,
		borderColor: colors.borderDarker,
		marginBottom: 25,
	},
	fieldContainer: {
		paddingHorizontal: 15,
		paddingBottom: 15,
	},
}

const validate = (values) => {
	const errors = {}
	// if (!values.name) {
	//   errors.name = I18n.t('enterAllfields');
	// }
	// if (!values.percent) {
	//   errors.percent = I18n.t('enterAllfields');
	// }

	// if (values.percent > 100) {
	//   errors.percent = I18n.t('errorInField');
	// }
	return errors
}

const OrdersAndSalesContainer = reduxForm({
	form: 'TaxesForm',
	validate,
})(OrdersAndSalesComponent)

const mapStateToProps = ({ auth, taxes, offline, preference, billing }) => ({
	auth,
	preference,
	user: auth.user,
	initialValues: taxes[0],
	isOnline: offline.online,
	billing,
})

export default connect(mapStateToProps, { taxesAccountSave, checkPlanKeys, checkFeatureIsAllowed, openModalWebview })(
	OrdersAndSalesContainer
)
