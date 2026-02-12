import React, { useEffect, useMemo, useState } from 'react'
import { DetailPage } from '../../../common'
import { Container, Padding, Row, Body12, Body14, RadioCircle, colors } from '@kyteapp/kyte-ui-components'
import { TouchableOpacity } from 'react-native'
import { NavigationProp } from '@react-navigation/native'
import { IProduct } from '@kyteapp/kyte-utils'

import {
	CONTENT_SPACING,
	createVariantForm,
	VARIANT_CREATE_FORM_NAME,
	VariantCreateFormValues,
} from './createVariantForm'
import { connect } from 'react-redux'
import { IVariantsState } from '../../../../stores/variants/variants.types'
import KyteBaseButton from '../../../common/buttons/KyteBaseButton'
import { getFormValues, InjectedFormProps } from 'redux-form'
import RequiredProductFieldsModal from '../../modals/RequiredProductFields'
import { generateTestID } from '../../../../util'
import {
	setVariantsNotification,
	setWizardPrimaryVariant,
	resetWizardVariation,
} from '../../../../stores/variants/actions/wizard-variation.actions'
import { generateProductSKUs } from '../../../../stores/variants/actions/wizard-variation.async.actions'
import { IAuthState } from '../../../../types/state/auth'
import { buildProductRequiredFields, IProductManaging } from '../../../../util/products/util-create'
import VariantLoader from './components/VariantLoader'
import VariantChooseMainExample from './components/VariantChooseMainExample'
import { productDetailUpdate } from '../../../../stores/actions'
import { ProductWithVariationDetailsTabKeys } from '../../../../enums'
import KyteNotifications from '../../../common/KyteNotifications'
import I18n from '../../../../i18n/i18n'
import { logEvent } from '../../../../integrations'
import NavigationService from '../../../../services/kyte-navigation'
import useWizardExitFlag from '../../../../hooks/useWizardExitFlag'

interface VariantChooseMainProps {
	navigation: NavigationProp<any>
	wizard: IVariantsState['wizard']
	variantFormValues: VariantCreateFormValues
	productFormValues?: IProduct
	auth: IAuthState
	productManaging: IProductManaging
	notifications: IVariantsState['notifications']
	generateProductSKUs: typeof generateProductSKUs
	setWizardPrimaryVariant: typeof setWizardPrimaryVariant
	resetWizardVariation: typeof resetWizardVariation
	productDetailUpdate: typeof productDetailUpdate
	setVariantsNotification: typeof setVariantsNotification
}

const Strings = {
	t_description: I18n.t('variantsWizard.chooseMain.subtitle'),
	t_title: I18n.t('variantsWizard.chooseMain.title'),
	t_continue: I18n.t('words.s.continue'),
}

type Props = VariantChooseMainProps & InjectedFormProps<VariantCreateFormValues, VariantChooseMainProps>

const VariantChooseMainComponent: React.FC<Props> = ({
	navigation,
	wizard,
	productFormValues,
	auth,
	productManaging,
	...props
}) => {
	const { allowExit } = useWizardExitFlag()
	const [isVisible, setModalVisibility] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { chosenVariations = [], isCreatingSKUs } = wizard
	const variantSelected = chosenVariations?.find((variation) => variation?.isPrimary)
	const hasVariantSelected = Boolean(variantSelected)
	const containerStyle = { flex: 1 }

	const submitProductSKUsGenerator = () => {
		// Prevent multiple submissions
		if (isSubmitting || !hasVariantSelected) return

		setIsSubmitting(true)
		// Check if required fields are filled
		const requiredFields = productFormValues?.name && productFormValues?.salePrice
		if (!requiredFields) {
			setIsSubmitting(false)
			return setModalVisibility(true)
		}

		const indexOfVariationSelected = variantSelected ? chosenVariations.indexOf(variantSelected) : 0

		logEvent('Product Variation Photo Selected', {
			photo_variation: indexOfVariationSelected === 0 ? 'primary' : 'secondary',
		})
		// Calling API to save variations and generate product SKUs
		// Adding the required fields to save the product
		const normalizedProduct = buildProductRequiredFields(productFormValues, productManaging, auth)
		props.generateProductSKUs(chosenVariations, normalizedProduct, (error, persistedProduct) => {
			setIsSubmitting(false)

			if (!error) {
				props.productDetailUpdate(persistedProduct, ProductWithVariationDetailsTabKeys.Variants)
				props.resetWizardVariation()
				allowExit()
				// productDetailUpdate is synchronous (thunk dispatch without return), so we reset right after dispatch
				NavigationService.resetNavigation('ProductDetail')
			}
			// Only reset isSubmitting after successful completion
		})
	}

	const notifications = useMemo(() => {
		const notificationWithHandler = props?.notifications?.map((notification: any) => ({
			...notification,
			handleClose: () => props?.setVariantsNotification([]), // TODO: remove only clicked notification
		}))

		return notificationWithHandler
	}, [props?.notifications])

	useEffect(() => {
		const removeNotifications = () => {
			props?.setVariantsNotification([])
		}
		props.setWizardPrimaryVariant(chosenVariations[0])
		return removeNotifications
	}, [])

	useEffect(() => {
		logEvent('Product Variation Photo Select View')
	}, [])

	return (
		<DetailPage
			goBack={navigation.goBack}
			navigate={navigation.navigate}
			navigation={navigation}
			pageTitle={Strings.t_title}
		>
			{isCreatingSKUs && <VariantLoader />}
				<Container backgroundColor={colors.lightBg} flex={1}>
					<Container flex={1} padding={CONTENT_SPACING}>
						<Container flex={1}>
							<VariantChooseMainExample chosenVariations={chosenVariations} />
						</Container>
						<Padding vertical={CONTENT_SPACING}>
							<Body12 lineHeight={18}>{Strings.t_description}</Body12>
						</Padding>
						{chosenVariations.map((variation, index) => (
							<TouchableOpacity
								{...generateTestID(`checkbox-variant-${index}`)}
								onPress={() => props.setWizardPrimaryVariant(variation)}
								key={index}
							>
								<Padding bottom={CONTENT_SPACING}>
									<Row alignItems="center">
										<RadioCircle active={variation?.isPrimary} />
										<Padding left={CONTENT_SPACING}>
											<Body14 testID={`name_variation_${index}`}>{variation?.name}</Body14>
										</Padding>
									</Row>
								</Padding>
							</TouchableOpacity>
						))}
						<Padding bottom={CONTENT_SPACING / 2} />
						<KyteBaseButton
							{...generateTestID('choose-vt')}
							onPress={submitProductSKUsGenerator}
							type={hasVariantSelected && !isSubmitting ? 'primary' : 'tertiary'}
							disabledButton={!hasVariantSelected || isSubmitting}
						>
							{Strings.t_continue}
						</KyteBaseButton>
					</Container>
				</Container>
			<KyteNotifications containerProps={{}} notifications={notifications} />
			<RequiredProductFieldsModal isModalVisible={isVisible} hideModal={() => setModalVisibility(false)} />
		</DetailPage>
	)
}

const VariantChooseMain = createVariantForm(VARIANT_CREATE_FORM_NAME, VariantChooseMainComponent)

const mapStateToProps = (state: any) => {
	const { variants, auth, products }: { variants: IVariantsState; auth: IAuthState; products: any } = state
	const { productManaging }: { productManaging: IProductManaging } = products
	const { notifications } = variants

	return {
		variantFormValues: getFormValues(VARIANT_CREATE_FORM_NAME)(state),
		productFormValues: getFormValues('ProductSave')(state),
		wizard: variants.wizard,
		auth,
		notifications,
		productManaging,
	}
}

export default connect(mapStateToProps, {
	generateProductSKUs,
	setWizardPrimaryVariant,
	resetWizardVariation,
	productDetailUpdate,
	setVariantsNotification,
})(VariantChooseMain as any)
