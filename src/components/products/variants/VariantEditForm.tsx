import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { IParentProduct, IProductVariant } from '@kyteapp/kyte-utils'
import { Controller, useForm } from 'react-hook-form'
import { Alert, ScrollView, TouchableOpacity } from 'react-native'
import { Container, KyteText } from '@kyteapp/kyte-ui-components'
import KyteNotifications from '../../common/KyteNotifications'
import { CurrencyText, Input, KyteIcon, MaskedInput } from '../../common'
import I18n from '../../../i18n/i18n'
import { getProductByCode } from '../../../repository'
import { logEvent } from '../../../integrations'
import FieldFormBox from '../../common/form/FieldFormBox'
import { colors } from '../../../styles'
import {
	editProductVariant,
	EditProductVariantProps,
} from '../../../stores/variants/actions/product-variant.async.actions'
import { IVariantsState } from '../../../stores/variants/variants.types'
import { setVariantsNotification } from '../../../stores/variants/actions/wizard-variation.actions'
import { RootState } from '../../../types/state/RootState'
import KyteBaseButton from '../../common/buttons/KyteBaseButton'
import IconButton from '@kyteapp/kyte-ui-components/src/packages/buttons/icon-button/IconButton'

const Strings = {
	PRICE_BOX_TITLE: I18n.t('words.s.price'),
	PRODUCT_IDENTIFICATION_BOX_TITLE: I18n.t('IdentificationLabel'),
	INACTIVATE_BOX_TITLE: I18n.t('variants.inactiveLabel'),
	NAME_PLACEHOLDER: I18n.t('namePlaceholder'),
	SALE_PRICE_PLACEHOLDER: I18n.t('productPricePlaceholder'),
	SALE_PROMOTIONAL_PRICE_PLACEHOLDER: I18n.t('productPromotionalPricePlaceholder'),
	SALE_COST_PRICE_PLACEHOLDER: I18n.t('productPriceCostPlaceholder'),
	CODE_PLACEHOLDER: I18n.t('productCodeLabel'),
	BUTTON_SAVE: I18n.t('alertSave'),
	PRODUCT_PROMOTIONAL_PRICE_INFO: I18n.t('productPromotionalPriceInfo'),
	PRODUCT_PRICE_FROM: I18n.t('productPriceFromTo.from'),
	PRODUCT_PRICE_TO: I18n.t('productPriceFromTo.to'),
	EXAMPLE_ABBR: I18n.t('exampleAbbr'),
	PRODUCT_COST_GRATER_THAN_PRICE_ALERT: I18n.t('productCostGraterThanPriceAlert'),
	BARCODE_DUPLICATED_ALERT_TITLE: I18n.t('barcodeDuplicatedAlertTitle'),
	BARCODE_DUPLICATED_ALERT_TEXT: I18n.t('barcodeDuplicatedAlertText'),
	ALERT_CONFIRM: I18n.t('alertConfirm'),
	ALERT_DISMISS: I18n.t('alertDismiss'),
	ALERT_OK: I18n.t('alertOk'),
	ALERT_ATTENTION: I18n.t('words.s.attentionAlert'),
}

interface VariantEditFormProps {
	productVariant: IProductVariant
	parentProduct: IParentProduct
	notificationsState: IVariantsState['notifications']
	setVariantsNotification: typeof setVariantsNotification
	editProductVariant: ({ product, callback }: EditProductVariantProps) => void
}

const VariantEditForm: React.FC<VariantEditFormProps> = ({
	parentProduct,
	setVariantsNotification,
	notificationsState,
	productVariant,
	...props
}) => {
	const navigation = useNavigation()
	const { salePrice, salePromotionalPrice, saleCostPrice, code } = productVariant
	const containerStyle = { flex: 1, backgroundColor: colors.lightBg }
	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm({
		defaultValues: {
			salePrice: salePrice,
			salePromotionalPrice: salePromotionalPrice ?? undefined,
			saleCostPrice: saleCostPrice ?? undefined,
			code: code ?? undefined,
		},
	})

	const handleSave = ({
		salePrice,
		salePromotionalPrice,
		saleCostPrice,
		code,
		isFromModal = false,
	}: {
		salePrice: number
		salePromotionalPrice?: number
		saleCostPrice?: number
		code?: string | number
		isFromModal?: boolean
	}) => {
		if (salePrice < (saleCostPrice || 0) && !isFromModal) {
			Alert.alert(Strings.ALERT_ATTENTION, Strings.PRODUCT_COST_GRATER_THAN_PRICE_ALERT, [
				{
					text: Strings.ALERT_CONFIRM,
					onPress: () => handleSave({ salePrice, salePromotionalPrice, saleCostPrice, code, isFromModal: true }),
				},
				{ text: Strings.ALERT_DISMISS },
			])
			return
		}

		const updatedProduct = {
			...productVariant,
			salePrice,
			salePromotionalPrice,
			saleCostPrice,
			code: code ?? '',
		}

		props.editProductVariant({
			product: updatedProduct,
			parentProduct,
			callback: () => {
				logEvent('Product Variant Save')
				navigation.goBack()
			},
		})
	}

	const handleBarcodeRead = (barcode: string) => {
		const duplicated = getProductByCode(barcode)
		if (duplicated) {
			Alert.alert(
				Strings.BARCODE_DUPLICATED_ALERT_TITLE,
				`${Strings.BARCODE_DUPLICATED_ALERT_TEXT} ${duplicated.name}.`,
				[{ text: Strings.ALERT_OK }]
			)
		} else {
			logEvent('ProductSaveBarCode')
			setValue('code', barcode)
		}
	}

	const notifications = useMemo(() => {
		const notificationWithHandler = notificationsState?.map((notification) => ({
			...notification,
			handleClose: () => setVariantsNotification([]),
		}))

		return notificationWithHandler
	}, [notificationsState])

	useEffect(() => {
		setVariantsNotification([])
		
		return () => {
			setVariantsNotification([])
		}
	}, [])

	useEffect(() => {
		logEvent("Product Variant Detail View")
	}, [])

	return (
		<Container style={containerStyle}>
			<ScrollView>
				<FieldFormBox title={Strings.PRICE_BOX_TITLE}>
					<Controller
						control={control}
						name="salePrice"
						render={({ field: { onChange, value } }) => (
							<MaskedInput
								returnKeyType="done"
								type="money"
								keyboardType="numeric"
								placeholder={Strings.SALE_PRICE_PLACEHOLDER}
								placeholderColor={colors.tipColor}
								value={value}
								onChangeText={onChange}
								error={errors.salePrice ? 'erro no valor' : ''}
							/>
						)}
					/>
					<Container>
						<Controller
							control={control}
							name="salePromotionalPrice"
							render={({ field: { onChange, value } }) => (
								<MaskedInput
									type="money"
									keyboardType="numeric"
									placeholder={Strings.SALE_PROMOTIONAL_PRICE_PLACEHOLDER}
									placeholderColor={colors.tipColor}
									value={value}
									onChangeText={onChange}
									returnKeyType="done"
									rightIcon={value != null && <IconButton name="cross-thin" size={12} onPress={() => onChange(null)} />}
								/>
							)}
						/>
						<KyteText
							style={{
								marginLeft: 6,
								marginTop: -8,
								marginBottom: 6,
							}}
							size={11}
							color={colors.secondaryGrey}
							lineHeight={16.5}
						>
							{`${Strings.PRODUCT_PROMOTIONAL_PRICE_INFO} (${Strings.EXAMPLE_ABBR} ${Strings.PRODUCT_PRICE_FROM} `}
							<KyteText pallete="grayBlue" textDecorationLine="line-through">
								<CurrencyText value={10} />
							</KyteText>{' '}
							{Strings.PRODUCT_PRICE_TO} <CurrencyText value={5} />)
						</KyteText>
					</Container>

					<Controller
						control={control}
						name="saleCostPrice"
						render={({ field: { onChange, value } }) => (
							<MaskedInput
								type="money"
								returnKeyType="done"
								keyboardType="numeric"
								placeholder={Strings.SALE_COST_PRICE_PLACEHOLDER}
								placeholderColor={colors.tipColor}
								value={value}
								onChangeText={onChange}
							/>
						)}
					/>
				</FieldFormBox>
				<FieldFormBox title={Strings.PRODUCT_IDENTIFICATION_BOX_TITLE}>
					{/* Uncomment this code for the second version release of this feature. */}
					{/* It is not required for the initial version. */}
					{/* <Controller
							control={control}
							name="name"
							render={({ field: { onChange, value } }) => (
								<Input
									placeholder={Strings.NAME_PLACEHOLDER}
									placeholderColor={colors.tipColor}
									value={value}
									onChangeText={onChange}
									error={errors.name ? 'erro no nome' : ''}
								/>
							)}
						/> */}
					<Controller
						control={control}
						name="code"
						render={({ field: { onChange, value } }) => (
							<Input
								returnKeyType="done"
								placeholder={Strings.CODE_PLACEHOLDER}
								placeholderColor={colors.tipColor}
								value={value}
								onChangeText={onChange}
								rightIcon={
									<TouchableOpacity
										onPress={() =>
											navigation.navigate('BarcodeReader', {
												onBarcodeRead: (barcode: string) => handleBarcodeRead(barcode),
											})
										}
									>
										<KyteIcon name="barcode" color={colors.secondaryBg} size={24} />
									</TouchableOpacity>
								}
							/>
						)}
					/>
				</FieldFormBox>
				{/* Uncomment this code for the second version release of this feature. */}
				{/* It is not required for the initial version. */}
				{/* <FieldFormBox isLast>
						<Row alignItems="center" justifyContent="space-between">
							<KyteText lineHeight={21} weight={500} color={colors.primaryDarker} size={14}>{Strings.INACTIVATE_BOX_TITLE}</KyteText>
							<Controller
								control={control}
								name="inactiveVariant"
								render={({ field: { onChange, value } }) => (
									<KyteSwitch
										onValueChange={onChange}
										active={value}
									/>
								)}
							/>
						</Row>
					</FieldFormBox> */}
			</ScrollView>
			<Container>
				<KyteNotifications containerProps={{}} notifications={notifications} />
			</Container>

			<Container backgroundColor={colors.white} padding={15}>
				<KyteBaseButton noDisabledAlert onPress={handleSubmit((data) => handleSave(data))}>
					{Strings.BUTTON_SAVE}
				</KyteBaseButton>
			</Container>
		</Container>
	)
}

const mapStateToProps = (state: RootState) => ({
	parentProduct: state.products.detail,
	productVariant: state.variants.productVariant,
	notificationsState: state.variants.notifications,
})

export default connect(mapStateToProps, {
	editProductVariant,
	setVariantsNotification,
})(VariantEditForm as any)
