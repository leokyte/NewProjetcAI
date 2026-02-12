import { View, Image, Platform } from 'react-native'
import React from 'react'
import Share from 'react-native-share'
import moment from 'moment'
import { KyteBottomBar, KyteText } from '@kyteapp/kyte-ui-components'

import { Icon } from 'react-native-elements'
import { TextButton, ActionButton, KyteButton, KyteModal } from '.'
import I18n from '../../i18n/i18n'

import { colors } from '../../styles'

const BottomMessageModal = (props) => {
	const {
		image,
		imageStyle,
		title,
		titleStyle,
		modalHeight,
		paragraph,
		paragraphStyle,
		paragraphManageStyle,
		actionText,
		actionTextOnPress,
		actionButtonText,
		actionButtonOnPress,
		actionOnClose,
		secondButtonText = I18n.t('plansAndPrices.seePlans'),
		shareButton,
		shareOptions,
		redirectToRate,
		fromManageButton,
		fromManageButtonAction,
		billingInfo,
		seePlans,
		hideSeePlansButton,
	} = props

	const renderImage = () => (
		<View style={styles.imageContainer}>
			<Image style={imageStyle || styles.defaultImageStyle} resizeMode="contain" source={{ uri: image }} />
		</View>
	)
	const renderTitle = () => (
		<KyteText
			style={[titleStyle, { paddingVertical: 10 }]}
			weight="Semibold"
			size={20}
			textAlign="center"
			lineHeight={30}
		>
			{title}
		</KyteText>
	)

	const renderParagraph = () => {
		const dateFormatted = moment(billingInfo?.endDate).format('DD/MM/YY.')

		return (
			<View style={styles.centeralizeView}>
				<KyteText
					style={fromManageButton ? paragraphManageStyle : paragraphStyle}
					size={15}
					lineHeight={22.5}
					textAlign="center"
					marginBottom={fromManageButton ? 25 : 0}
				>
					{fromManageButton ? `${shareOptions?.manage_paragraph} ${dateFormatted}` : paragraph}
				</KyteText>
			</View>
		)
	}

	const renderActionText = () => {
		if (typeof actionText !== 'string') {
			return actionText
		}

		if (actionTextOnPress) {
			return (
				<View style={styles.actionTextContainer}>
					<TextButton
						onPress={actionTextOnPress}
						title={actionText}
						color={colors.actionColor}
						size={14}
						weight="Medium"
					/>
				</View>
			)
		}

		return (
			<View style={styles.actionTextContainer}>
				<KyteText size={15} lineHeight={22.5}>
					{actionText}
				</KyteText>
			</View>
		)
	}

	const renderActionButton = () => {
		const labelManageButton = shareOptions?.manage_button

		return (
			<View>
				{!shareButton || fromManageButton ? (
					<KyteBottomBar
						columnButton
						title={fromManageButton ? labelManageButton : actionButtonText}
						onPress={fromManageButton ? fromManageButtonAction : actionButtonOnPress}
						secondButtonTitle={secondButtonText}
						secondButtonOnPress={
							hideSeePlansButton
								? null
								: () => {
										seePlans()
								  }
						}
					/>
				) : (
					renderShareButton()
				)}
			</View>
		)
	}

	const renderShareButton = () => (
		<View style={styles.shareBottomButtonContainer}>
			<View style={styles.shareBottomButton}>
				<KyteButton
					width={50}
					height={50}
					background={colors.disabledIcon}
					onPress={() =>
						Share.open({
							title: shareOptions.title,
							subject: shareOptions.subject,
							message: shareOptions.message,
							url: shareOptions.url,
						})
					}
				>
					<Icon name="share" />
				</KyteButton>
			</View>
			<View style={{ flex: 1 }}>
				<ActionButton onPress={actionButtonOnPress && redirectToRate}>{actionButtonText}</ActionButton>
			</View>
		</View>
	)

	const renderContent = () => {
		const hasImage = !!image
		const hasTitle = !!title
		const hasParagraph = !!paragraph
		const hasActionText = !!actionText
		const hasActionButton = !!actionButtonText

		return (
			<View style={styles.mainContainer}>
				<View style={styles.container}>
					{hasImage ? renderImage() : null}
					{hasTitle ? renderTitle() : null}
					{hasParagraph ? renderParagraph() : null}
					{hasActionText ? renderActionText() : null}
					{hasActionButton ? renderActionButton() : null}
				</View>
			</View>
		)
	}

	return (
		<KyteModal
			bottomPage
			propagateSwipe
			noPadding
			noEdges
			useSlider
			height={modalHeight || 'auto'}
			title=""
			isModalVisible
			hideModal={() => actionOnClose ? actionOnClose() : actionButtonOnPress()}
			style={{ position: 'relative' }}
			swipeDirection={['down']}
			topRadius={12}
			onSwipeComplete={props.onSwipeComplete}
		>
			{renderContent()}
		</KyteModal>
	)
}

const styles = {
	defaultImageStyle: {
		height: 119,
		width: 116,
	},
	mainContainer: {
		justifyContent: 'flex-end',
	},
	container: {
		backgroundColor: 'white',
		paddingTop: 12,
		paddingHorizontal: 12,
		borderTopRightRadius: 12,
		borderTopLeftRadius: 12,
		minHeight: 200,
	},
	actionTextContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
	},
	imageContainer: {
		alignItems: 'center',
		paddingVertical: 10,
	},
	shareBottomButtonContainer: {
		flexDirection: 'row',
	},
	shareBottomButton: {
		marginLeft: 10,
		marginBottom: 20,
	},
	centeralizeView: {
		width: '80%',
		marginLeft: '10%',
		marginRight: '10%',
	},
	actionButton: {
		paddingTop: Platform.OS === 'ios' ? 70 : 65,
	},
}

export default BottomMessageModal
