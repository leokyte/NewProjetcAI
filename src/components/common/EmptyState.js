import React, { memo } from 'react'
import {
	Container,
	Margin,
	KyteText,
	Body16,
	colors,
	LinkButton,
	KyteButton,
	Row,
	KyteIcon,
} from '@kyteapp/kyte-ui-components'
import { Image } from 'react-native'

const IMAGE_WIDTH = 140
const IMAGE_HEIGHT = 140

/**
 *
 * @param {{
 *  image: import('react-native').ImageProps,
 * onPressDescriptionBtn?: () => void
 * onPressSubmitBtn?: () => void
 * strings?: {
 *  title: string,
 *  description?: (string | { text: string, props: import('@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText').KyteTextProps})[],
 * titleProps?: import('@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText').KyteTextProps,
 * shouldDividerFooterButton?: boolean,
 * btnDescription?: string | string[],
 * btnSubmit?: string
 * }
 * leftIcon?: strings
 * }} param0
 */
function EmptyState({
	image,
	strings,
	titleProps,
	shouldDividerFooterButton,
	leftIcon,
	onPressDescriptionBtn,
	onPressSubmitBtn,
}) {
	const linkButtonProps = {
		size: 14,
		color: colors.green03Kyte,
		textAlign: 'center',
		onPress: onPressDescriptionBtn,
	}

	return (
        <Container flex={1}>
            <Container flex={1} padding={16} justifyContent="center">
				<Container alignItems="center">
					{Boolean(image) && (
						<Image
							width={IMAGE_WIDTH}
							height={IMAGE_HEIGHT}
							{...image}
							source={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT, ...image.source }}
							style={[{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }, image?.style]}
						/>
					)}
					{Boolean(strings.title) && (
						<Margin top={32}>
							<KyteText size={24} lineHeight={28} weight={600} {...titleProps}>
								{strings.title}
							</KyteText>
						</Margin>
					)}
					{Boolean(strings.description) && (
						<Margin top={12}>
							<KyteText textAlign="center">
								{strings?.description.map((description, index) => (
									// eslint-disable-next-line react/no-array-index-key
									(<Body16 lineHeight={24} key={index} {...description?.props}>
                                        {description?.text || description}
                                    </Body16>)
								))}
							</KyteText>
						</Margin>
					)}

					{Boolean(strings?.btnDescription) &&
						(typeof strings.btnDescription === 'string' ? (
							<Margin top={16}>
								<LinkButton {...linkButtonProps}>{strings.btnDescription}</LinkButton>
							</Margin>
						) : (
							<Margin top={16}>
								{strings.btnDescription.map((text, index) => (
									<LinkButton {...linkButtonProps} key={index}>
										{text}
									</LinkButton>
								))}
							</Margin>
						))}
				</Container>
			</Container>
            {Boolean(strings.btnSubmit) && (
				<Container padding={16} borderTopWidth={shouldDividerFooterButton ? 1 : 0} borderColor={colors.gray07}>
					<KyteButton type="primary" textStyle={{ fontSize: 16 }} onPress={onPressSubmitBtn}>
						<Row alignItems="center" justifyContent="center">
							{Boolean(leftIcon) && <KyteIcon name={leftIcon} size={18} color={colors.white} />}
							<Body16 color={colors.white} weight={600} marginLeft={5}>
								{strings.btnSubmit}
							</Body16>
						</Row>
					</KyteButton>
				</Container>
			)}
        </Container>
    );
}

export default memo(EmptyState)
