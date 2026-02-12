import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import Body13 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body13/Body13'
import React, { memo } from 'react'
import { connect } from 'react-redux'
import I18n from '../../../i18n/i18n'
import KyteButton from '@kyteapp/kyte-ui-components/src/packages/buttons/kyte-button/KyteButton'
import TooltipContainer from '../../common/utilities/TooltipContainer'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import { IVariant } from '../../../stores/variants/variants.types'
import { RootState } from '../../../types/state/RootState'
import { IAuthState } from '../../../types/state/auth'
import { ScrollView } from 'react-native'

type IVariantList = {
	list: IVariant[]
}

interface ProductVariationsManagerUIOwnProps {
	onPressRemoveVariationsBtn?: () => void
	onPressVariationsManagementBtn?: () => void
	variants: IVariantList
	renderVariationCards: () => React.ReactNode
	hasSignificantChanges: boolean
	isUpdating: boolean
	onUpdateVariations: () => void
}

interface ProductVariationsManagerUIStateProps {
	auth: IAuthState
}

type ProductVariationsManagerUIProps = ProductVariationsManagerUIOwnProps & ProductVariationsManagerUIStateProps

const Strings = {
	t_btn_remove: I18n.t('variants.removeVariations'),
	t_tooltip_title: I18n.t('variants.variantManagement2'),
	t_tooltip_description: I18n.t('variants.variationManagementDescription'),
	t_go_to_variations_management_btn: I18n.t('variants.goToConfigPage'),
	t_update_variants: I18n.t('variants.updateVariantsList'),
}

const ProductVariationsManagerUI: React.FC<ProductVariationsManagerUIProps> = ({
	onPressRemoveVariationsBtn,
	onPressVariationsManagementBtn,
	renderVariationCards,
	hasSignificantChanges,
	isUpdating,
	onUpdateVariations,
}) => {
	return (
		<Padding all={16} flex={1}>
			<Container flex={1}>
				<ScrollView showsVerticalScrollIndicator={false}>
					{renderVariationCards()}
					<Margin top={18}>
						<KyteButton
							activeBackgroundColor={colors.white}
							activeOpacity={0.7}
							backgroundColor={'transparent'}
							onPress={onPressRemoveVariationsBtn}
						>
							<Row alignItems="center">
								<KyteIcon name="trash" color={colors.red} />
								<Margin left={6}>
									<Body13 allowFontScaling={false} color={colors.red} lineHeight={13}>
										{Strings.t_btn_remove}
									</Body13>
								</Margin>
							</Row>
						</KyteButton>
					</Margin>

			{/* Tooltip for variation management */}
					<Margin top={18}>
						<TooltipContainer
							leftIcon="filter"
							terms={{
								description: [Strings.t_tooltip_title],
							}}
							help={
								Boolean(onPressVariationsManagementBtn)
									? {
											onPress: onPressVariationsManagementBtn!,
											leftIcon: 'nav-arrow-right',
											text: Strings.t_go_to_variations_management_btn,
									  }
									: undefined
							}
						/>
					</Margin>
				</ScrollView>
			</Container>
			<Margin top={32}>
				<KyteButton
					type={hasSignificantChanges && !isUpdating ? 'primary' : 'tertiary'}
					disabledButton={!hasSignificantChanges || isUpdating}
					borderColor="transparent"
					onPress={onUpdateVariations}
					activeOpacity={hasSignificantChanges && !isUpdating ? 1 : 0.5}
				>
					<KyteText
						allowFontScaling={false}
						color={hasSignificantChanges && !isUpdating ? colors.white : colors.disable01}
						lineHeight={24}
						style={{ fontSize: 16, opacity: hasSignificantChanges && !isUpdating ? 1 : 0.5 }}
					>
						{Strings.t_update_variants}
					</KyteText>
				</KyteButton>
			</Margin>
		</Padding>
	)
}

const mapStateToProps = (state: RootState): ProductVariationsManagerUIStateProps => ({
	auth: state.auth,
})

const ConnectedProductVariationsManagerUI = connect<
	ProductVariationsManagerUIStateProps,
	{},
	ProductVariationsManagerUIOwnProps
>(
	mapStateToProps,
	{}
)(ProductVariationsManagerUI)

export default memo(ConnectedProductVariationsManagerUI)
