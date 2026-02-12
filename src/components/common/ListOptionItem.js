import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import { Icon } from 'react-native-elements'
import { Margin } from '@kyteapp/kyte-ui-components'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import { KyteIcon } from './KyteIcon'
import { KyteTagNew } from './KyteTagNew'
import { colors } from '../../styles'
import Warning from './content/Warning'

const ListOptionItem = ({ item, index, isFree, ...props }) => {
	const itemSpacing = 12
	const alert = item?.alert
	const showAlert = alert?.active
	const tagProActive = item?.PROFeature?.isPaid && isFree
	const borderSetColor = () => {
		if (props.reverseColor) return colors.primaryColor
		if (props.billingList) return colors.primaryGrey

		return colors.lightBg
	}

	const resultBorderColor = borderSetColor()
	const s = {
		container: {
			height: props.billingList ? 90 : "auto",
			borderBottomWidth: props.billingList ? 0.2 : 1,
			paddingHorizontal: props.noPadding ? 0 : itemSpacing,
			justifyContent: 'center',
			borderBottomColor: resultBorderColor,
			paddingVertical: props.billingList ? 0 : 12,
			backgroundColor: props.reverseColor ? colors.primaryDarker : null,
		},
		itemContainer: (opacity) => ({
			flexDirection: 'row',
			justifyContent: 'center',
			opacity,
		}),
		itemContent: {
			flex: 1,
			flexDirection: 'column',
			justifyContent: 'center',
			paddingRight: 12,
		},
		textContent: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		corners: {
			width: 40,
			justifyContent: 'center',
			alignItems: 'center',
			leftSide: { paddingRight: itemSpacing },
			rightSide: { paddingLeft: itemSpacing },
		},
		endLine: {
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'row',
		},

		proLabel: {
			width: 40,
			alignItems: 'center',
			backgroundColor: colors.primaryBlack,
			textAlign: 'center',
			borderRadius: 50,
			height: 18,
		},
	}

	const renderLeftIcon = (item) => (
		<View style={[s.corners, s.corners.leftSide]}>
			{item.leftIcon.icon ? (
				<KyteIcon name={item.leftIcon.icon} color={item.leftIcon.color || colors.primaryColor} size={20} />
			) : (
				<Image source={{ uri: item.leftIcon.image }} style={item.leftIcon.style} />
			)}
		</View>
	)

	const renderBadge = (badgeContent, badgeCustomStyle = {}) => {
		const { badge, badgeText } = drawerStyles
		return (
			<View style={[badge, { marginLeft: 10 }, badgeCustomStyle]}>
				<Text style={badgeText}>{badgeContent.toUpperCase()}</Text>
			</View>
		)
	}

	const renderSubtitle = (subtitle, index) => {
		const contentText = () => {
			if (props.items?.[index]?.PROFeature?.isPaid) {
				return '80%'
			}
			if (props.items?.[index]?.billingList) {
				return '88%'
			}
			return '100%'
		}

		if (typeof subtitle === 'string') {
			return (
				<View>
					<KyteText
						marginTop={5}
						style={{
							lineHeight: props.items?.[index]?.billingList ? 17.6 : 0,
							width: contentText(),
						}}
						size={11}
						pallete={props.reverseColor ? 'white' : 'primaryBg'}
					>
						{subtitle}
					</KyteText>
				</View>
			)
		}

		return renderBadge(subtitle.badge, {
			width: 45,
			marginLeft: 0,
			marginVertical: 5,
		})
	}

	const renderChevron = () => (
		<View style={[s.corners, s.corners.rightSide]}>
			<Icon name="chevron-right" color={colors.terciaryBg} size={20} />
		</View>
	)

	const renderRightSide = (item) => {
		let content = item.rightSideContent

		if (!React.isValidElement(content)) {
			content = (
				<View style={[s.corners.rightSide]}>
					<KyteText style={[s.proLabel]} size={11} weight="Medium" color={colors.white}>
						PRO
					</KyteText>
				</View>
			)
		}

		return content
	}

	const renderTip = (tip) => {
		const { onPress } = tip
		return (
			<TouchableOpacity onPress={onPress || null}>
				<KyteIcon name="help" color={colors.tipColor} />
			</TouchableOpacity>
		)
	}

	return (
		<TouchableOpacity onPress={!item.disabled ? item.onPress : null} activeOpacity={0.8} {...item.testProps}>
			<View style={[s.container]}>
				<View style={[s.itemContainer(item.disabled ? 0.25 : 1), props?.items?.[index]?.containerStyle]}>
					{item.leftIcon ? renderLeftIcon(item) : null}
					<View style={s.itemContent}>
						<View style={s.textContent}>
							<KyteText
								size={props.billingList ? 13 : 14}
								weight="Medium"
								style={[{ lineHeight: 15 }, props.itemStyle, item.itemStyle]}
								color={props.reverseColor ? 'white' : item.color || colors.primaryColor}
							>
								{item.title}
							</KyteText>
							{Boolean(item.tagNew) && (
								<Margin left={8}>
									<KyteTagNew {...item.tagNew} />
								</Margin>
							)}
						</View>
						{item.subtitle && renderSubtitle(item.subtitle, index)}
					</View>
					<View style={s.endLine}>
						{item.tip && !tagProActive && renderTip(item.tip)}
						{props.hideChevron || item.hideChevron ? null : renderChevron()}
						{item.rightside || item.rightSideContent ? renderRightSide(item) : null}
					</View>
				</View>
				{showAlert && (
					<Container>
						<Margin top={12} />
						<Warning message={alert?.message} />
					</Container>
				)}
			</View>
		</TouchableOpacity>
	)
}

export default ListOptionItem
