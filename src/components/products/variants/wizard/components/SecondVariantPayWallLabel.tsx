import React from 'react'
import AlertBox from '../../../../common/content/AlertBox'
import { colors, Label, Row, Body12, Margin, KyteIcon, Container, KyteText } from '@kyteapp/kyte-ui-components'
import I18n from '../../../../../i18n/i18n'
import { renderBoldText } from '../../../../../util'
import { TouchableOpacity } from 'react-native'
import { KyteTag } from '../../../../common/KyteTag'

interface SecondVariantPayWallLabel {
	onPress?: () => void
}

const Strings = {
	t_grow: I18n.t('plansPage.grow.title'),
	t_second_variation: I18n.t('variants.secondVariation'),
	t_second_variation_info: I18n.t('variantsWizard.secondVariationInfo'),
	t_level_up: I18n.t('expressions.doUpgrade'),
}

const SecondVariantPayWallLabel: React.FC<SecondVariantPayWallLabel> = ({ onPress }) => {
	return (
		<AlertBox>
			<Row alignItems="center">
				<Body12 marginRight={4} uppercase color={colors.green00} weight={500}>
					{Strings.t_second_variation}
				</Body12>
				<KyteTag
					text={Strings.t_grow}
				/>
			</Row>
			<Margin bottom={4} />
			<KyteText size={12} lineHeight={16} color={colors.gray02Kyte}>
					{renderBoldText(Strings.t_second_variation_info, { size: 12 })}
			</KyteText>
			<Margin bottom={10} />
			<TouchableOpacity onPress={onPress}>
				<Row alignItems="center">
					<KyteIcon
						size={11}
						name="nav-arrow-right"
						style={{
							marginRight: 10,
							marginLeft: 6
						}}
					/>
					<KyteText lineHeight={1.5 * 13} size={13} weight={500}>{Strings.t_level_up}</KyteText>
				</Row>
			</TouchableOpacity>
		</AlertBox>
	)
}
export default SecondVariantPayWallLabel
