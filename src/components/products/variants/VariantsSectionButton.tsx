import { checkIsParentProduct, getGroupedVariantsName, IProduct } from '@kyteapp/kyte-utils'
import React, { ComponentProps } from 'react'
import I18n from '../../../i18n/i18n'
import SectionButton from '../../common/SectionButton'
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row'
import Body11 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body11/Body11'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import IconButton from '@kyteapp/kyte-ui-components/src/packages/buttons/icon-button/IconButton'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import LinkButton from '@kyteapp/kyte-ui-components/src/packages/buttons/link-button/LinkButton'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'

interface VariantsSectionButtonProps extends ComponentProps<typeof SectionButton> {
	product: Partial<IProduct>
}

const VariantsSectionButton: React.FC<VariantsSectionButtonProps> = ({ product, onPress, ...props }) => {
	const hasVariants = checkIsParentProduct((product as IProduct) ?? {})
	const groupedVariationNames = getGroupedVariantsName(product, ', ').toUpperCase()

	return (
		<SectionButton
			{...props}
			title={props.title ?? I18n.t('variants.title')}
			labelText={props.labelText ?? (!hasVariants && I18n.t('words.s.new').toUpperCase())}
			labelType={props.labelType ?? 'primary'}
			onPress={onPress}
			icon={
				props.icon ?? hasVariants ? (
					<Row alignItems="center">
						<Body11 lineHeight={11} ellipsizeMode={'tail'} numberOfLines={1} color={colors.gray06} weight={500}>
							{groupedVariationNames}
						</Body11>
						<Margin left={8}>
							<IconButton name="nav-arrow-right" size={11} />
						</Margin>
					</Row>
				) : (
					<Container flex={0} justifyContent="center">
						<Padding vertical={4}>
							<LinkButton numberOfLines={1} onPress={onPress}>
								{I18n.t('words.s.add')?.toUpperCase?.() ?? ''}
							</LinkButton>
						</Padding>
					</Container>
				)
			}
			testID={props.testID ?? 'add-variants'}
		/>
	)
}

export default VariantsSectionButton
