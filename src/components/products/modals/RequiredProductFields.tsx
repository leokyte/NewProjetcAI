import React from 'react'
import { IProduct } from '@kyteapp/kyte-utils'
import { Padding } from '@kyteapp/kyte-ui-components'
import { Field, FormErrors, getFormValues, InjectedFormProps, reduxForm } from 'redux-form'
import I18n from '../../../i18n/i18n'
import { connect, Dispatch } from 'react-redux'
import { generateTestID } from '../../../util'
import { Platform } from 'react-native'
import FieldInput from '../../common/form/FieldInput'
import FieldMaskedInput from '../../common/form/FieldMaskedInput'
import KyteBaseButton from '../../common/buttons/KyteBaseButton'
import { colors } from '../../../styles'
import BottomModal from '../../common/modals/BottomModal'
import { updateExternalForm } from '../variants/wizard/createVariantForm'

export interface RequiredProductFieldsProps {
	isModalVisible: boolean
	hideModal: () => void
	dispatch?: Dispatch
}

interface StateProps {
	initialValues?: Partial<IProduct>
	productRequiredFieldsValues?: Partial<IProduct>
}

const REQUIRED_PRODUCT_FIELDS_FORM_NAME = 'ProducRequiredSave'

type Props = RequiredProductFieldsProps &
	StateProps &
	InjectedFormProps<
		IProduct,
		RequiredProductFieldsProps & {
			dispatch?: Dispatch
		}
	>

const Strings = {
	t_proceed: 'Salvar',
	t_description:
		'Você precisa preencher o [[bold]]Nome do produto[[bold]] e [[bold]]Preço base[[bold]] para gerar a lista de variações do seu produto.',
	t_title: 'Dados obrigatórios',
}

const RequiredProductFieldsModalComponent = ({
	handleSubmit,
	productRequiredFieldsValues,
	valid,
	isModalVisible,
	hideModal,
	dispatch,
}: Props) => {
	const onSubmit = () => {
		hideModal()
		updateExternalForm('ProductSave', 'name', productRequiredFieldsValues?.name)(dispatch)
		updateExternalForm('ProductSave', 'salePrice', productRequiredFieldsValues?.salePrice)(dispatch)
	}

	return (
		<BottomModal
			isVisible={isModalVisible}
			onClose={hideModal}
			title={Strings.t_title}
			description={Strings.t_description}
			closeBtnProps="Closed_info_product_wizard"
		>
			<Field
				placeholder={I18n.t('productNamePlaceholder')}
				placeholderColor={colors.primaryGrey}
				name="name"
				component={FieldInput}
				style={Platform.select({ ios: { height: 32 } })}
				autoCorrect
				testProps={generateTestID('product-name-pes')}
			/>
			<Field
				placeholder={I18n.t('productPricePlaceholder')}
				placeholderColor={colors.primaryGrey}
				kind="numeric"
				name="salePrice"
				type="money"
				component={FieldMaskedInput}
				maxLength={18}
				style={Platform.select({ ios: { height: 32 } })}
				testProps={generateTestID('product-price-pes')}
			/>
			<Padding bottom={30} />
			<KyteBaseButton onPress={handleSubmit(onSubmit)} type={valid ? 'primary' : 'tertiary'}>
				{Strings.t_proceed}
			</KyteBaseButton>
		</BottomModal>
	)
}

function validate(values: IProduct) {
	const errors: FormErrors<IProduct> = {}

	if (!values.name) {
		errors.name = I18n.t('productValidateName')
	}
	if (!values.salePrice) {
		errors.salePrice = I18n.t('productValidatePrice')
	}
	return errors
}

const mapStateToProps = (state: any): StateProps => ({
	initialValues: getFormValues('ProductSave')(state) as IProduct,
	productRequiredFieldsValues: getFormValues(REQUIRED_PRODUCT_FIELDS_FORM_NAME)(state),
})

const withReduxForm = reduxForm<IProduct, RequiredProductFieldsProps>({
	form: REQUIRED_PRODUCT_FIELDS_FORM_NAME,
	validate,
	enableReinitialize: false,
})(RequiredProductFieldsModalComponent)

const RequiredProductFieldsModal = connect<StateProps, {}, RequiredProductFieldsProps>(mapStateToProps)(
	withReduxForm as any
)

export default RequiredProductFieldsModal
