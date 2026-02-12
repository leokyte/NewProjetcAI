import React from 'react'
import { connect } from 'react-redux'
import {
	KyteSwitch,
	CurrencyText,
	Padding,
	Row,
	Container,
	KyteText,
	Center,
	colors,
} from '@kyteapp/kyte-ui-components'
import { IVariant } from '../../../../../stores/variants/variants.types'
import { ICurrency, IProductVariant } from '@kyteapp/kyte-utils'
import { renderBoldText, TestID } from '../../../../../util'
import { TouchableOpacity } from 'react-native'
import {
	CONTENT_HORIZONTAL_SPACING,
	CONTENT_VERTICAL_SPACING,
	PHOTO_BUTTOM_CONTENT_SIZE,
	PHOTO_BUTTON_SIZE,
} from './constants'
import KyteBaseButton from '../../../../common/buttons/KyteBaseButton'

interface GroupedSKUsItemProps {
	variation?: Partial<IVariant>
	onPress: () => void
	testID?: TestID
	currency: ICurrency
	variationsCount?: number
	disabled?: boolean
	rightElement?: React.ReactNode
	subtitleElement?: React.ReactNode
}

const GroupedSKUsItem: React.FC<GroupedSKUsItemProps> = ({
	variation,
	onPress,
	testID,
	variationsCount,
	disabled,
	rightElement,
	subtitleElement,
}) => {
	const hasOnlyOneVariation = variationsCount && variationsCount === 1

	const addPhotoButton = (
		<Container marginRight={10} paddingRight={10} borderRightWidth={1} borderColor={colors.gray08}>
			<KyteBaseButton
				backgroundColor={colors.gray10}
				borderColor={'transparent'}
				containerStyle={{ width: PHOTO_BUTTON_SIZE, height: PHOTO_BUTTON_SIZE }}
				onPress={onPress}
				customContent={
					<Center>
						<KyteText weight={'300'} size={PHOTO_BUTTOM_CONTENT_SIZE} color={colors.green03Kyte}>
							{'+'}
						</KyteText>
					</Center>
				}
			/>
		</Container>
	)

	return (
		<TouchableOpacity
			{...testID}
			style={disabled ? undefined : { backgroundColor: colors.white }}
			disabled={disabled}
			onPress={onPress}
		>
			<Padding horizontal={CONTENT_HORIZONTAL_SPACING} vertical={CONTENT_VERTICAL_SPACING}>
				<Row alignItems="center">
					{hasOnlyOneVariation ? addPhotoButton : null}
					<Container flex={1}>
						<Container flex={1} justifyContent="center">
							<Padding vertical={10}>
								<KyteText size={14}>
									{renderBoldText(`${variation?.name}: [[bold]]${variation?.options?.[0].title}[[bold]]`)}
								</KyteText>
							</Padding>
							{subtitleElement}
						</Container>
					</Container>
					{rightElement}
				</Row>
			</Padding>
		</TouchableOpacity>
	)
}

const mapStateToProps = (state: any) => ({
	currency: state.preference.account.currency,
	decimalCurrency: state.preference.account.decimalCurrency,
})

export default connect(mapStateToProps)(GroupedSKUsItem)
