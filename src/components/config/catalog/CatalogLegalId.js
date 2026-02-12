/* eslint-disable arrow-body-style */
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import {
	DetailPage,
	Input,
	ActionButton,
	KyteText,
	KyteIcon,
	LoadingCleanScreen,
	CustomKeyboardAvoidingView,
	KyteAlert,
	WizardProgressBar,
} from '../../common'
import { checkIsBr, validateCpfOrCpnj, formatCpfOrCnpj, isAndroid } from '../../../util'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { hasCatalog, storeAccountSave } from '../../../stores/actions'
import { CATALOG_WIZARD_TOTAL_STEPS } from '../../../kyte-constants'
import { logEvent } from '../../../integrations'

const strings = {
	PAGE_TITLE: I18n.t('IdentificationLabel'),
	WIZARD_TIPS_TEXT1: I18n.t('catalog.legalId.wizardTips.text1'),
	WIZARD_TIPS_TEXT2_PT1: I18n.t('catalog.legalId.wizardTips.text2.part1'),
	WIZARD_TIPS_TEXT2_PT2: I18n.t('catalog.legalId.wizardTips.text2.part2'),
	BR_ID_PLACEHOLDER: I18n.t('BrIdLabel'),
	FOREIGN_ID_PLACEHOLDER: I18n.t('IDLabel'),
	NAME_ID_PLACEHOLDER: I18n.t('namePlaceholder'),
	BUSINESS_ID_PLACEHOLDER: I18n.t('BusinessIdLabel'),
	BR_INVALID_ID_ERROR: I18n.t('BrInvalidIdError'),
	INSTRUCTION: I18n.t('LegalIdInstructions'),
	FOREIGN_TIP_TITLE: I18n.t('LegalIdForeignWarningTitle'),
	FOREIGN_TIP_WARNING: I18n.t('LegalIdForeignWarningText'),
	CATALOG_WARNING: I18n.t('LegalIdCatalogWarning'),
}

const CatalogLegalId = (props) => {
	// Redux Store
	const { authStore, navigation } = props
	const { legalId = {} } = authStore

	// local States
	const [isLoading, setIsLoading] = useState(false)
	const [stateId, setStateId] = useState(legalId.id || '')
	const [stateName, setStateName] = useState(legalId.name || '')
	const [idType, setIdType] = useState(legalId.type)
	const [idError, setIdError] = useState(false)
	const [showForeignTip, setShowForeignTip] = useState(false)

	// local consts
	const isBr = checkIsBr()
	const itHasCatalog = props.hasCatalog()

	useEffect(() => {
		logEvent('Catalog User ID View', { where: itHasCatalog ? 'catalog_settings' : 'catalog_wizard' })	
	}, [])

	// FUNCTIONS methods

	const saveForm = () => {
		const error = isBr && !idType ? strings.BR_INVALID_ID_ERROR : false
		if (error) return setIdError(error)

		setIsLoading(true)
		const newLegalId = {
			id: formatCpfOrCnpj(stateId),
			name: stateName,
			type: idType,
		}
		const store = {
			...authStore,
			legalId: newLegalId,
		}

		return props.storeAccountSave(store, () => {
			setIsLoading(false)
			if (itHasCatalog) {
				return navigation.goBack()
			}
			logEvent('Catalog ID Add')
			
			return navigation.navigate('CatalogTermsAndConditions')
		})
	}

	const validateFields = () => {
		return stateName.length && stateId.length
	}

	const setBrId = (value) => {
		// set type
		setStateId(value)

		if (!validateCpfOrCpnj(value)) return setIdType(false)
		const formattedValue = value.toString().replace(/[^0-9]/g, '')
		return formattedValue.length === 11 ? setIdType('cpf') : setIdType('cnpj')
	}

	const setForeignId = (value) => {
		setStateId(value)
		setIdType('int')
	}

	//
	// RENDER methods
	//

	const renderWizardTip = () => (
		<View style={styles.wizardTipContainer}>
			<KyteText size={19} weight={400} lineHeight={26} >
				{strings.WIZARD_TIPS_TEXT1}
			</KyteText>
			<KyteText size={18} weight={400} lineHeight={26} style={styles.textStyle}>
				{strings.WIZARD_TIPS_TEXT2_PT1}{' '}
				<KyteText size={18} weight={500} lineHeight={26}>
					{strings.WIZARD_TIPS_TEXT2_PT2}
				</KyteText>
			</KyteText>
		</View>
	)

	const renderTipIcon = (tipOnClick) => (
		<TouchableOpacity onPress={tipOnClick} style={styles.tipIcon}>
			<KyteIcon name={'help'} size={20} color={colors.grayBlue} />
		</TouchableOpacity>
	)

	const renderInput = (args) => (
		<View style={styles.inputContainer}>
			<Input
				placeholder={args.placeholder}
				value={args.value}
				onChangeText={args.onChangeText}
				placeholderColor={colors.primaryGrey}
				error={args.error}
				keyboardType={args.keyboardType || 'default'}
			/>
			{args.tip ? renderTipIcon(args.tipOnClick) : null}
		</View>
	)

	const renderIdInput = () => {
		const args = {
			placeholder: isBr ? strings.BR_ID_PLACEHOLDER : strings.FOREIGN_ID_PLACEHOLDER,
			value: stateId,
			onChangeText: (id) => (isBr ? setBrId(id) : setForeignId(id)),
			error: idError,
			keyboardType: isAndroid ? 'numeric' : 'numbers-and-punctuation',
			tip: !isBr,
			tipOnClick: () => setShowForeignTip(true),
		}
		return renderInput(args)
	}

	const renderNameInput = () => {
		const args = {
			placeholder: idType === 'cnpj' ? strings.BUSINESS_ID_PLACEHOLDER : strings.NAME_ID_PLACEHOLDER,
			value: stateName,
			onChangeText: (name) => setStateName(name),
		}
		return renderInput(args)
	}

	const renderSaveButton = () => {
		return (
			<CustomKeyboardAvoidingView>
				<View style={styles.saveButtonContainer}>
					<ActionButton
						onPress={() => saveForm()}
						disabled={!validateFields()}
						noDisabledAlert
					>
						{itHasCatalog ? I18n.t('descriptionSaveButton') : I18n.t('words.s.proceed')}
					</ActionButton>
				</View>
			</CustomKeyboardAvoidingView>
		)
	}

	const renderInstruction = () => {
		return (
			<View style={styles.instructionContainer}>
				<KyteText pallete="grayBlue" size={12} lineHeight={17} textAlign="center">
					{strings.INSTRUCTION}
				</KyteText>
			</View>
		)
	}

	const renderForeignTip = () => {
		return (
			<KyteAlert
				hideModal={() => setShowForeignTip(false)}
				title={strings.FOREIGN_TIP_TITLE}
				contentText={strings.FOREIGN_TIP_WARNING}
			/>
		)
	}

	const renderCatalogWarning = () => (
		<View style={styles.catalogWarningContainer}>
			<KyteIcon name="warning" size={16} style={styles.warningIcon} />
			<KyteText weight={'Medium'} style={styles.catalogWarningText}>
				{strings.CATALOG_WARNING}
			</KyteText>
		</View>
	)

	return (
		<DetailPage pageTitle={strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
			{!itHasCatalog ? <WizardProgressBar currentStep={4} totalSteps={CATALOG_WIZARD_TOTAL_STEPS} /> : null}
			<ScrollView contentContainerStyle={styles.mainContainer}>
				{!itHasCatalog ? renderWizardTip() : null}
				{renderIdInput()}
				{renderNameInput()}
				{renderCatalogWarning()}
				{renderInstruction()}
			</ScrollView>
			{renderSaveButton()}
			{isLoading ? <LoadingCleanScreen /> : null}
			{showForeignTip ? renderForeignTip() : null}
		</DetailPage>
	)
}

const styles = {
	mainContainer: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 20,
	},
	wizardTipContainer: {
		alignItems: 'center',
		top: 10,
		marginBottom: 20,
	},
  textStyle: {
		marginTop: 20,
    textAlign: 'center'
	},
	inputContainer: {
		marginTop: 10,
	},
	saveButtonContainer: {
		paddingVertical: 10,
	},
	instructionContainer: {
		marginTop: 25,
		paddingHorizontal: 20,
	},
	tipIcon: {
		position: 'absolute',
		right: 5,
		bottom: 10,
		padding: 5,
	},
	catalogWarningContainer: {
		backgroundColor: colors.lightBg,
		alignItems: 'center',
		paddingVertical: 30,
		marginTop: 20,
		justifyContent: 'center'
	},
	catalogWarningText: {
		color: colors.primaryBg,
		fontSize: 12,
		left: 16,
	},
	warningIcon: {
		position: 'absolute',
		left: 16,
	},
}

const mapStateToProps = ({ auth }) => ({
	authStore: auth.store,
})

export default connect(mapStateToProps, { hasCatalog, storeAccountSave })(CatalogLegalId)
