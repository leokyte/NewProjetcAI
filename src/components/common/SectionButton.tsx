import React, { ComponentProps } from 'react'
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { Row, Margin, Label } from '@kyteapp/kyte-ui-components'
import { colors, Type } from '../../styles'
import { generateTestID } from '../../util/qa/qa-utils'
import { KyteIcon } from './KyteIcon'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'

const styles = StyleSheet.create({
	containerButtonFieldsExtras: {
		flex: 1,
		borderColor: colors.drawerIcon,
		borderTopWidth: 1.5,
		borderBottomWidth: 1.5,
	},
	buttonFieldsExtras: {
		flexDirection: 'row',
		paddingHorizontal: 24,
		paddingVertical: 15,
		alignItems: 'center',
	},
	iconButtonFieldsExtras: {
		flexGrow: 0,
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
		paddingVertical: 4,
	},
})

interface Props {
	title: string
	icon: string | React.ReactNode
	onPress?: () => void
	testID?: string
	labelText?: string
	labelBackgroundColor?: string
	labelType?: ComponentProps<typeof Label>['labelType']
	description?: string
}
const SectionButton: React.FC<Props> = ({
	title,
	icon,
	onPress,
	testID,
	labelText,
	labelBackgroundColor,
	labelType,
	description,
}) => {
	const { containerButtonFieldsExtras, buttonFieldsExtras, iconButtonFieldsExtras } = styles

	return (
		<TouchableOpacity
			style={{ justifyContent: 'center' }}
			onPress={onPress}
			activeOpacity={0.8}
			{...generateTestID(testID || '')}
		>
			<View style={containerButtonFieldsExtras}>
				<View style={buttonFieldsExtras}>
					<View style={{ flexGrow: 1.08 }}>
						<Row alignItems="center">
							<KyteText weight={'Medium'} lineHeight={17} size={17}>
								{title}
							</KyteText>
							{labelText && (
								<Margin left={8}>
									<Label backgroundColor={labelBackgroundColor} type={labelType}>
										{labelText}
									</Label>
								</Margin>
							)}
						</Row>

						{Boolean(description) && (
							<Margin top={5}>
								<KyteText size={11}>{description}</KyteText>
							</Margin>
						)}
					</View>
					{React.isValidElement(icon) ? (
						icon
					) : (
						<View style={iconButtonFieldsExtras}>
							<KyteIcon name={icon} size={16} color={colors.primaryBg} />
						</View>
					)}
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default SectionButton
