import React, { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'

import { DetailPage, CustomKeyboardAvoidingView, ListOptions } from '../../common'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'

const STRINGS = {
	PAGE_TITLE: I18n.t('productsTabProductsLabel'),
	CATEGORY_TITLE: I18n.t('productsTabCategoriesLabel'),
	VARIATION_TITLE: I18n.t('variantsList.title'),
}

const ProductConfig = () => {
	const navigation = useNavigation()

	const makeNavigation = ({ key, name }: { key: string; name: string }) => {
		navigation.navigate({
			key,
			name,
		})
	}

	const pages = useMemo(
		() => [
			{
				title: STRINGS.CATEGORY_TITLE,
				onPress: () => makeNavigation({ key: 'ProductCategoriesPage', name: 'ProductCategories' }),
				leftIcon: { icon: 'folder', color: colors.secondaryBg },
			},
			{
				title: STRINGS.VARIATION_TITLE,
				onPress: () => makeNavigation({ key: 'VariationsManagerPage', name: 'VariationsManager' }),
				leftIcon: { icon: 'products', color: colors.secondaryBg },
				tagNew: true,
			},
		],
		[]
	)

	const handleGoBack = () => {
		navigation.reset({
			index: 0,
			routes: [{ name: 'ConfigContainer' }],
		})
	}

	return (
		<DetailPage pageTitle={STRINGS.PAGE_TITLE} goBack={() => handleGoBack()}>
			<CustomKeyboardAvoidingView style={{ flex: 1 }}>
				<ListOptions items={pages} {...({} as any)} />
			</CustomKeyboardAvoidingView>
		</DetailPage>
	)
}

export default ProductConfig
