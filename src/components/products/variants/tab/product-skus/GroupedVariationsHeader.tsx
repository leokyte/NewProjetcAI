import React from 'react'
import { Container, Padding, Row, KyteText, KyteIcon } from '@kyteapp/kyte-ui-components'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { CONTENT_HORIZONTAL_SPACING } from './constants'
import { getGroupedVariantsName, IParentProduct, IProductVariant } from '@kyteapp/kyte-utils'
import I18n from '../../../../../i18n/i18n'
import { TouchableOpacity } from 'react-native'
import { KyteTagComingSoon } from '../../../../common/KyteTagComingSoon'

const Strings = {
	t_variations_title: I18n.t('variantsList.title'),
}

interface GroupedVariationsHeaderProps {
	product?: IParentProduct
	onPress?: () => void
}

const GroupedVariationsHeader: React.FC<GroupedVariationsHeaderProps> = ({ product, onPress }) => {
	const groupedVariationsNames = getGroupedVariantsName(product, ', ')

	return (
		<TouchableOpacity onPress={onPress}>
			<Padding
				style={{ backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.gray08 }}
				horizontal={CONTENT_HORIZONTAL_SPACING}
			>
				<Container height={60}>
					<Row flex={1} alignItems="center">
						<Row flex={1} alignItems="center">
							<KyteText weight={500} size={14}>
								{Strings.t_variations_title}
							</KyteText>
						</Row>
						<Row justifyContent="flex-end" alignItems="center" flex={1}>
							<KyteText
								ellipsizeMode={'tail'}
								numberOfLines={1}
								color={colors.gray06}
								weight={500}
								size={11}
								align="center"
								testID="label_variation_pes"
								style={{ marginRight: 16 }}
							>
								{groupedVariationsNames}
							</KyteText>
							<KyteIcon size={12} name="nav-arrow-right" />
						</Row>
					</Row>
				</Container>
			</Padding>
		</TouchableOpacity>
	)
}

export default GroupedVariationsHeader
