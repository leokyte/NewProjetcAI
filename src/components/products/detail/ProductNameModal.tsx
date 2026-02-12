import React, { FC, useEffect } from 'react'
import { Input, KyteModal } from '../../common'
import { Body12, Padding } from '@kyteapp/kyte-ui-components'
import { Field } from 'redux-form'
import I18n from '../../../i18n/i18n'
import BottomButton from '../../common/BottomButton'
import { colors } from '../../../styles'
import { logEvent } from '../../../integrations'
import { Platform } from 'react-native'

interface ProductNameModalProps {
	isVisible: boolean
	nameValue: string
	hasCategory: boolean
	hasPreviousDescription: boolean
	hasStoreInfo: boolean
	isKeyboardVisible: boolean
	onClose: () => void
	onSubmit: () => void
}

const Strings = {
	GENERATE_AI_DESCRIPTION: I18n.t('generateAIDescription'),
	NEXT: I18n.t('words.s.proceed'),
	ENTER_PRODUCT_NAME: I18n.t('enterProductName'),
	PRODUCT_NAME: I18n.t('productNamePlaceholder'),
}

const renderInput = (field: any) => (
	<Input
		{...field.input}
		autoFocus={Platform.OS === 'android'}
		placeholder={Strings.PRODUCT_NAME}
		placeholderColor={colors.tipColor}
		onChangeText={field.input.onChange}
	/>
)

export const ProductNameModal: FC<ProductNameModalProps> = ({
	isVisible,
	nameValue,
	hasCategory,
	hasPreviousDescription,
	hasStoreInfo,
	isKeyboardVisible,
	onClose,
	onSubmit,
}) => {
	useEffect(() => {
		logEvent('Product AI Description Complete Info View', {
			has_previous_content: hasPreviousDescription,
			has_category: hasCategory,
			has_store_info: hasStoreInfo,
		})
	}, [])

	return (
		<KyteModal
			isModalVisible={isVisible}
			hideModal={onClose}
			bottomPage
			height={isKeyboardVisible && Platform.OS === 'ios' ? '80%' : 'auto'}
			propagateSwipe
			coverScreen={false}
			topRadius={12}
			title={Strings.GENERATE_AI_DESCRIPTION}
		>
			<Padding horizontal={16} bottom={16}>
				<Body12 marginBottom={15} marginTop={10}>
					{Strings.ENTER_PRODUCT_NAME}
				</Body12>

				<Field name="name" component={renderInput} autoFocus />
			</Padding>

			<BottomButton
				onPress={() => {
					onClose()
					onSubmit()
				}}
				disabled={!nameValue}
				noDisabledAlert
			>
				{Strings.NEXT}
			</BottomButton>
		</KyteModal>
	)
}
