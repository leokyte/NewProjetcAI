import React, { Component } from 'react'
import { ScrollView, View, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import { CheckBox } from 'react-native-elements'
import { InputTextArea, ActionButton, CustomKeyboardAvoidingView, DetailPage } from '../../common'
import { scaffolding, colors, Type, colorSet } from '../../../styles'
import { currentSaleAddObservation } from '../../../stores/actions'
import I18n from '../../../i18n/i18n'

const SCREEN_HEIGHT = Dimensions.get('window').height
class CartObservation extends Component {
	static navigationOptions = {
		header: null,
	}

	constructor(props) {
		super(props)
		const { observation, showObservationInReceipt } = this.props.route.params
		this.state = {
			observation,
			showObservationInReceipt,
		}
	}

	saveObservation() {
		const { goBack } = this.props.navigation
		const { observation, showObservationInReceipt } = this.state
		this.props.currentSaleAddObservation(observation, showObservationInReceipt)
		goBack()
	}

	saveWithCallback() {
		const { observation, showObservationInReceipt } = this.state
		const { goBack } = this.props.navigation
		const { params = {} } = this.props.route

		params.callback(observation, showObservationInReceipt)
		goBack()
	}

	displayCheckBox() {
		const { observation, showObservationInReceipt } = this.state
		const { checkStyles, checkboxText } = styles

		if (observation.length >= 1) {
			return (
				<CheckBox
					containerStyle={checkStyles}
					checkedIcon={'check-box'}
					uncheckedIcon={'check-box-outline-blank'}
					iconType={'material'}
					onPress={() => this.setState({ showObservationInReceipt: !showObservationInReceipt })}
					checkedColor={colors.actionColor}
					checked={showObservationInReceipt}
					title={I18n.t('saleObservationShowInReceipt')}
					textStyle={checkboxText}
				/>
			)
		}
		return null
	}

	clearObservation() {
		const { showObservationInReceipt } = this.state

		this.setState({ observation: '' }, this.props.currentSaleAddObservation('', showObservationInReceipt))
	}

	render() {
		const { bottomContainer } = scaffolding
		const { bottomContainerStyle, checkboxContainer, buttonContainer } = styles
		const { observation, showObservationInReceipt } = this.state
		const { goBack } = this.props.navigation
		const { params = {} } = this.props.route

		const rightText = {
			text: I18n.t('words.s.clear'),
			onPress: () => this.clearObservation(),
		}

		return (
			<DetailPage pageTitle={I18n.t('observationPageTitle')} goBack={goBack} rightText={rightText}>
				<CustomKeyboardAvoidingView style={{ flex: 1 }}>
					<ScrollView style={{ flex: 1 }}>
						<InputTextArea
							placeholder={I18n.t('observationPlaceholder')}
							placeholderColor={colors.fadePrimary}
							value={observation}
							numberOfLines={2}
							onChangeText={(text) => this.setState({ observation: text })}
							style={{ height: SCREEN_HEIGHT - 150 }}
							multiline
							textAlignVertical={'top'}
							noBorder
							hideLabel
							flex
							maxLength={1000}
							autoCorrect
							testID="observation-cart"
						/>
					</ScrollView>

					<View style={[bottomContainer, bottomContainerStyle]}>
						<View style={checkboxContainer}>{this.displayCheckBox()}</View>

						<View style={buttonContainer}>
							<ActionButton
								alertTitle={I18n.t('words.s.attention')}
								alertDescription={I18n.t('enterAllfields')}
								onPress={params.callback ? () => this.saveWithCallback() : () => this.saveObservation()}
							>
								{I18n.t('observationSaveButton')}
							</ActionButton>
						</View>
					</View>
				</CustomKeyboardAvoidingView>
			</DetailPage>
		)
	}
}

const styles = {
	bottomContainerStyle: {
		backgroundColor: colors.lightBg,
		height: 130,
		borderTopColor: colors.littleDarkGray,
		borderTopWidth: 1,
	},
	checkboxContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkStyles: {
		backgroundColor: 'transparent',
		justifyContent: 'center',
		borderWidth: 0,
		marginLeft: 0,
		marginRight: 0,
		paddingTop: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
	},
	checkboxText: [Type.Regular, colorSet(colors.primaryColor), Type.fontSize(14), { fontWeight: 'normal' }],
	buttonContainer: {
		flex: 1,
	},
}

export default connect(null, { currentSaleAddObservation })(CartObservation)
