import { useNavigation } from '@react-navigation/native'
import React, { useCallback } from 'react'
import KyteWarning from '../../../../common/KyteWarning'
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { VariantsScreens } from '../../../../../enums'
import I18n from '../../../../../i18n/i18n'
import { TouchableOpacity } from 'react-native'

interface CatalogVersionWarningProps {
	customOnPress?: () => undefined
}

const Strings = {
	message_1: I18n.t('variants.catalogVersionWarning1'),
	message_2: I18n.t('variants.catalogVersionWarning2'),
}

const CatalogVersionWarning: React.FC<CatalogVersionWarningProps> = ({ customOnPress }) => {
	const navigation = useNavigation()

	const defaultOnPress = useCallback(() => {
		navigation.navigate(VariantsScreens.CatalogVersion)
	}, [])

	return (
		<TouchableOpacity onPress={customOnPress ?? defaultOnPress}>
			<KyteWarning>
				<Row alignItems="center" justifyContent="center">
					<KyteText style={{ flexShrink: 1 }} textAlign='center' color={colors.gray02Kyte} size={12} lineHeight={18} weight={500}>
						{`${Strings.message_1}`} 
						<KyteText
							color={colors.gray02Kyte}
							textDecorationLine="underline"
							size={12}
							weight={500}
							lineHeight={18}
							style={{ backgroundColor: 'transparent' }}
						>
							{` ${Strings.message_2}`}
						</KyteText>
					</KyteText>
				</Row>
			</KyteWarning>
		</TouchableOpacity>
		
	)
}

export default CatalogVersionWarning
