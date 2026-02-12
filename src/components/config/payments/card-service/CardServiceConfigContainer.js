/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react'
import { Alert, Keyboard, StyleSheet } from 'react-native'
import { reduxForm, Field, getFormValues, isDirty as checkIsDirty } from 'redux-form'
import {
	BorderlessKyteInput,
	colors,
	Container,
	InputStatusColors,
	KyteButton,
	KyteIcon,
	KyteText,
	ListTileSwitch,
	Margin,
	NotificationType,
	Padding,
	Row,
} from '@kyteapp/kyte-ui-components'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { formatCurrencyValue } from '@kyteapp/kyte-ui-components/src/packages/utils/util-currency-format'
import { getRawValue } from '@kyteapp/kyte-ui-components/src/packages/utils/util-mask'
import { KyteSafeAreaView } from '../../../common/KyteSafeAreaView'
import { KyteToolbar } from '../../../common/KyteToolbar'
import i18n from '../../../../i18n/i18n'

import { KyteDropdown } from '../../../common/KyteDropdown'
import { LoadingCleanScreen } from '../../../common/LoadingCleanScreen'
import { capitalizeFirstLetter } from '../../../../util/util-common'
import CardServiceConfigTooltip from './components/CardServiceConfigTooltip'
import {
	getCardServiceFormInitialValues,
	validateCardServiceConfig,
	checkIsCardServiceCustomized,
} from '../../../../util/util-preference'
import { preferenceSetCardServiceConfig } from '../../../../stores/actions/PreferenceActions'
import KyteNotifications from '../../../common/KyteNotifications'
import { CardServiceConfigError } from '../../../../enums/CardServiceConfigError'
import { logEvent } from '../../../../integrations'

const styles = StyleSheet.create({
	outerContainer: {
		flex: 1,
	},
})
const Strings = {
	t_title: i18n.t('deadlineAndFeesTitle'),
	t_form_title: i18n.t('myCardReader'),
	t_label_credit_card: i18n.t('creditCards'),
	t_label_debit_card: i18n.t('debitCards'),
	t_btn_submit: i18n.t('alertSave'),
	t_option_days: i18n.t('calendarDays'),
	t_option_business_days: i18n.t('businessDays'),
	t_label_settlement_period: i18n.t('words.s.deadline'),
	t_label_service_fee: `${i18n.t('words.s.tax')} (%)`,
	t_toast_success: i18n.t('deadlineAndFees.toast.success'),
	t_toast_error: i18n.t('deadlineAndFees.toast.error'),
	t_alert_empty_title: i18n.t('deadlineAndFees.empty.title'),
	t_alert_empty_description: i18n.t('deadlineAndFees.empty.description'),
	t_alert_no_period_title: i18n.t('deadlineAndFees.noDeadline.title'),
	t_alert_no_period_description: i18n.t('deadlineAndFees.noDeadline.description'),
	t_alert_no_fee_title: i18n.t('deadlineAndFees.noFee.title'),
	t_alert_no_fee_description: i18n.t('deadlineAndFees.noFee.description'),
}

class CardServiceConfigContainer extends Component {
	constructor(props) {
		super(props)
		this.state = { toast: null, isLoading: false }
	}

	componentDidMount() {
		const formValues = getCardServiceFormInitialValues(this.props.initialValues)
		const didCustomize = checkIsCardServiceCustomized(formValues)

		logEvent('Inflow Payment Config View', { is_empty: !didCustomize })
	}
	renderInputField(field) {
		return (
			<BorderlessKyteInput
				{...field}
				onChangeText={field.input.onChange}
				value={String(field.input.value)}
				keyboardType="numeric"
				containerProps={{ ...field.containerProps, style: { width: 56, ...field.containerProps?.style } }}
				inputProps={{ ...field.inputProps, style: { paddingRight: 0, ...field.inputProps?.style } }}
				labelProps={{ ...field.labelProps, style: { left: 7, ...field.labelProps?.style } }}
			/>
		)
	}

	renderSwitchField(field) {
		return (
			<ListTileSwitch
				{...field}
				paddingHorizontal={16}
				onPress={() => field.input.onChange(!field.input.value)}
				active={Boolean(field.input.value)}
				paddingVertical={14}
				title={{ ...field.title, size: 14, weight: 400 }}
			/>
		)
	}

	renderSelectField(field) {
		const options = [
			{
				value: 'days',
				labelText: Strings.t_option_days,
				title: capitalizeFirstLetter(Strings.t_option_days),
				onPress: () => field.input.onChange('days'),
			},
			{
				value: 'businessDays',
				labelText: Strings.t_option_business_days,
				title: capitalizeFirstLetter(Strings.t_option_business_days),
				onPress: () => field.input.onChange('businessDays'),
			},
		]
		const checkedIndex = Math.max(
			options.findIndex(({ value }) => value === field.input.value),
			0
		)

		return (
			<KyteDropdown
				checkedIndex={checkedIndex}
				mainViewProps={{ style: { justifyContent: 'space-between' } }}
				shouldHideLeftIcon
				options={options}
			/>
		)
	}

	renderConfigFields(fieldNames = {}) {
		const { currency } = this.props

		return (
            <Padding horizontal={16} top={16} bottom={24}>
                <Row>
					<Container>
						<Field
							name={fieldNames.period}
							component={this.renderInputField}
							label={Strings.t_label_settlement_period}
							format={(value) => Number(String(value).slice(-2)?.replace?.(/\D/g, '') ?? 0)}
						/>
					</Container>
					<Container marginLeft={16} borderBottomWidth={1} borderColor={InputStatusColors.disabled} flex={1}>
						<Field name={fieldNames.type} component={this.renderSelectField} />
					</Container>
					<Margin left={16}>
						<Field
							name={fieldNames.fee}
							component={this.renderInputField}
							label={Strings.t_label_service_fee}
							normalize={(value) => {
								const rawValue = getRawValue(String(value).slice(-5), currency)
								return rawValue
							}}
							format={(rawValue) => formatCurrencyValue(rawValue || 0, currency, true, true)}
							containerProps={{ style: { width: 80 } }}
						/>
					</Margin>
				</Row>
            </Padding>
        );
	}

	saveConfig(config) {
		const { initialize } = this.props
		const timer = 3000
		const removeToast = () => this.setState({ toast: null })
		const defaultToastProps = { handleClose: removeToast, onAutoDismiss: removeToast }
		const successToast = { ...defaultToastProps, timer, title: Strings.t_toast_success, type: NotificationType.SUCCESS }
		const errorToast = { ...defaultToastProps, timer, title: Strings.t_toast_error, type: NotificationType.ERROR }
		const updatedConfig = getCardServiceFormInitialValues(config)
		const successCallback = () => {
			logEvent('Inflow Payment Config Save', { object: updatedConfig })
			initialize(updatedConfig)
			this.setState({ toast: successToast, isLoading: false })
			Keyboard.dismiss()
		}
		const errorCallback = () => {
			this.setState({ toast: errorToast, isLoading: false })
			Keyboard.dismiss()
		}

		this.setState({ isLoading: true })
		// eslint-disable-next-line react/destructuring-assignment
		this.props.preferenceSetCardServiceConfig(updatedConfig, successCallback, errorCallback)
	}

	showConfirmationModal({ modal, updatedConfig }) {
		if (modal) {
			Alert.alert(modal.title, modal.description, [
				{ style: 'cancel', text: i18n.t('alertDismiss') },
				{ style: 'default', text: i18n.t('alertConfirm'), onPress: () => this.saveConfig(updatedConfig) },
			])
		}
	}

	onSubmit(values) {
		const updatedValues = getCardServiceFormInitialValues(values)
		const errorType = validateCardServiceConfig(values)
		const confirmationModal = this.getConfirmationModal(errorType)

		if (confirmationModal) {
			logEvent('Inflow Payment Config Warning', { state: confirmationModal.eventParam })
			return this.showConfirmationModal({ modal: confirmationModal, updatedConfig: updatedValues })
		}

		try {
			this.saveConfig(values)
		} catch {
			/* */
		}
	}

	getConfirmationModal(errorType) {
		const confirmationModalsMap = {
			[CardServiceConfigError.NO_PERIOD_AND_FEE]: {
				title: Strings.t_alert_empty_title,
				description: Strings.t_alert_empty_description,
				eventParam: 'no fee and term',
			},
			[CardServiceConfigError.NO_PERIOD]: {
				title: Strings.t_alert_no_period_title,
				description: Strings.t_alert_no_period_description,
				eventParam: 'instant receivement',
			},
			[CardServiceConfigError.NO_FEE]: {
				title: Strings.t_alert_no_fee_title,
				description: Strings.t_alert_no_fee_description,
				eventParam: 'no fee',
			},
		}
		const confirmationModal = confirmationModalsMap[errorType]

		return confirmationModal
	}

	render() {
		const { navigation, formValues, handleSubmit, isDirty } = this.props
		const { toast, isLoading } = this.state
		const canSave = isDirty

		return (
			<KyteSafeAreaView style={styles.outerContainer}>
				<KyteToolbar
					innerPage
					headerTitle={Strings.t_title}
					goBack={navigation.goBack}
					borderBottom={1}
					rightButtons={[
						{
							icon: 'help',
							onPress: () => navigation.navigate('CardServiceHelp'),
							iconSize: 18,
						},
					]}
				/>
				<Container flex={1}>
					<Container backgroundColor={colors.white}>
						<Padding all={16}>
							<KyteText uppercase weight={500} color={colors.gray06}>
								{Strings.t_form_title}
							</KyteText>
						</Padding>
						<Field
							name="credit.active"
							component={this.renderSwitchField}
							columnContent={<KyteIcon name="credit-card" />}
							title={{ text: Strings.t_label_credit_card }}
						/>
						{Boolean(formValues?.credit?.active) &&
							this.renderConfigFields({
								period: 'credit.settlementPeriod',
								type: 'credit.settlementPeriodType',
								fee: 'credit.serviceFee',
							})}

						<Field
							name="debit.active"
							component={this.renderSwitchField}
							columnContent={<KyteIcon name="debit-card" />}
							title={{ text: Strings.t_label_debit_card }}
							borderBottomWidth={0}
						/>

						{Boolean(formValues?.debit?.active) &&
							this.renderConfigFields({
								period: 'debit.settlementPeriod',
								type: 'debit.settlementPeriodType',
								fee: 'debit.serviceFee',
							})}
					</Container>

					<Container flex={1} padding={16}>
						<CardServiceConfigTooltip />
					</Container>
					<Container padding={16} backgroundColor={colors.white}>
						<KyteButton
							type={canSave ? 'primary' : 'tertiary'}
							onPress={handleSubmit(this.onSubmit.bind(this))}
							disabledButton={!canSave}
							textStyle={{ fontWeight: '500', fontSize: 16, color: canSave ? colors.white : colors.disable01 }}
						>
							{Strings.t_btn_submit}
						</KyteButton>
					</Container>
				</Container>
				{Boolean(toast) && <KyteNotifications notifications={[toast]} />}
				{Boolean(isLoading) && <LoadingCleanScreen />}
			</KyteSafeAreaView>
		)
	}
}

const formName = 'CardServiceConfigForm'
const CardServiceConfigForm = reduxForm({ form: formName })(CardServiceConfigContainer)

const mapStateToProps = (state) => ({
	initialValues: getCardServiceFormInitialValues(state.preference.account.cardService),
	formValues: getFormValues(formName)(state),
	isDirty: checkIsDirty(formName)(state),
	currency: state.preference.account.currency,
})
const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators({ preferenceSetCardServiceConfig }, dispatch),
})
export default connect(mapStateToProps, mapDispatchToProps)(CardServiceConfigForm)
