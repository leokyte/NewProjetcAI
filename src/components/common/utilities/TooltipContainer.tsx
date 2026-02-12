import React, { isValidElement, memo } from 'react'
import {
	Body12,
	Body13,
	colors,
	Container,
	KyteIcon,
	KyteText,
	LinkButton,
	Margin,
	Padding,
	Row,
} from '@kyteapp/kyte-ui-components'
import type { KyteTextProps } from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import type { KyteIconProps } from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'
import { View } from 'react-native'

interface TooltipContainerProps {
	leftIcon?: string
	leftComponent?: JSX.Element
	containerBg?: string
	iconColor?: string
	terms: {
		title?: string
		description?: (string | { text: string; props?: KyteTextProps } | JSX.Element)[]
	}
	help?: {
		onPress: () => void
		leftIcon: string
		leftIconProps?: KyteIconProps
		text: string
	}
	descriptionComponent?: JSX.Element
	titleStyle?: object
	descriptionStyle?: object
}

function TooltipContainer({ terms, leftIcon, help, containerBg, iconColor, leftComponent, descriptionComponent, titleStyle, descriptionStyle }: TooltipContainerProps) {
	return (
		<Container backgroundColor={containerBg || colors.gray08} borderRadius={8}>
			<Padding vertical={20} left={20} right={40}>
				<Row alignItems="center">
					{Boolean(leftIcon) && (
						<Margin right={14}>
							<KyteIcon name={leftIcon} color={iconColor || colors.gray02Kyte} size={20} />
						</Margin>
					)}
					{Boolean(leftComponent) && (
						<Margin right={14}>
							{leftComponent}
						</Margin>
					)}
					<Container justifyContent="flex-start" alignItems="flex-start">
						{Boolean(terms.title) && (
							<Body13 weight={500} lineHeight={19.5} style={{...titleStyle}}>
								{terms.title}
							</Body13>
						)}
						{Boolean(terms.description) && (
							<KyteText style={{...descriptionStyle}}>
								{isValidElement(terms?.description) ? terms?.description : 
									terms?.description?.map((description, index) => (
										<Body12
											lineHeight={18}
											style={{ flexShrink: 1 }}
											key={index}
											{...(typeof description === "object" && "props" in description ? description.props : {})}
										>
											{typeof description === "object" && "text" in description
												? description.text
												: description}
										</Body12>
									)
								)}
							</KyteText>
						)}
						{Boolean(descriptionComponent) && descriptionComponent}
						{Boolean(help) && (
							<Margin top={8}>
								<LinkButton onPress={help?.onPress}>
									<Row alignItems="center">
										<KyteIcon name={help?.leftIcon} size={12} {...help?.leftIconProps} />
										<Margin left={8}>
											<Body13 weight={500}>{help?.text}</Body13>
										</Margin>
									</Row>
								</LinkButton>
							</Margin>
						)}
					</Container>
				</Row>
			</Padding>
		</Container>
	)
}

export default memo(TooltipContainer)
