import { useNavigation } from '@react-navigation/native'
import React, { memo, useCallback } from 'react'
import TooltipContainer from '../../common/utilities/TooltipContainer'
import I18n from '../../../i18n/i18n'
import { VariantsScreens } from '../../../enums'

const Strings = {
	t_description: I18n.t('variants.catalogVersionTooltip'),
	t_helpBtn: I18n.t('fbe.goToCatalogConfig'),
}
const CatalogVersionTooltip: React.FC = () => {
	const navigation = useNavigation()

	const onPress = useCallback(() => {
		navigation.navigate(VariantsScreens.CatalogVersion)
	}, [])

	return (
		<TooltipContainer
			terms={{ description: [Strings.t_description] }}
			leftIcon="cog"
			help={{
				text: Strings.t_helpBtn,
				onPress: onPress,
				leftIcon: 'nav-arrow-right',
			}}
		/>
	)
}

export default memo(CatalogVersionTooltip)
