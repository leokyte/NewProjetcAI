import { View, Dimensions, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Viewports, isFree, isTrial, isPro, isGrow } from '@kyteapp/kyte-ui-components'
import Intercom from '@intercom/intercom-react-native'
import { KyteModal, TextButton, KyteText, UserProgress, KyteIcon, CenterContent, ActionButton } from '../common'
import { remoteConfigGetValue, logEvent } from '../../integrations'
import {
	toggleHelperVisibility,
	setHelperActualStep,
	productDetailBySale,
	updateHelperState,
	resendCodeValidation,
	checkPlanKeys,
	toggleBlockManagePlan,
	updateIntercomUserData,
} from '../../stores/actions'
import { HelperStepsStates, Breakpoints } from '../../enums'
import { guidedStepState, unguidedStepState, checkUserPermission, generateTestID } from '../../util'
import NavigationService from '../../services/kyte-navigation'
import { colors } from '../../styles'
import I18n from '../../i18n/i18n'
import HelperStep from './HelperStep'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

const stepState = (state) => HelperStepsStates.items[HelperStepsStates[state]].id
const active = stepState('ACTIVE')
const completed = stepState('COMPLETED')
const highlighted = stepState('HIGHLIGHTED')
const disabled = stepState('DISABLED')

class Helper extends Component {
	constructor(props) {
		super(props)

		this.state = {
			[active]: {},
			[completed]: {},
			[highlighted]: {},
			[disabled]: {},
			contentHeight: 0,
			helperType: '',
			notPro: false,
			isAllowed: false,
		}
	}

	componentDidMount() {
		// Getting Step Styles from remote config
		remoteConfigGetValue(active, (k) => this.setState({ [active]: k }), 'json')
		remoteConfigGetValue(completed, (k) => this.setState({ [completed]: k }), 'json')
		remoteConfigGetValue(highlighted, (k) => this.setState({ [highlighted]: k }), 'json')
		remoteConfigGetValue(disabled, (k) => this.setState({ [disabled]: k }), 'json')
		remoteConfigGetValue('helperType', (k) => this.setState({ helperType: k }))

		this.props.checkPlanKeys('').then((isAllowed) => {
			this.setState({ isAllowed })
		})
	}

	componentWillUnmount() {
		clearTimeout(this.timer)
	}

	permissionAlert() {
		Alert.alert(I18n.t('permissionDeniedAlertTitle'), I18n.t('permissionDeniedDescription'), [
			{ text: I18n.t('alertOk') },
		])
	}

	checkUserHasPermission() {
		const { user } = this.props

		return checkUserPermission(user.permissions).isAdmin || checkUserPermission(user.permissions).isOwner
	}

	inviteUser(hasPermission, step) {
		const { authVerified } = this.props.user
		if (!authVerified) return this.goToConfirmationAccount()

		this.stepNavigate(step)
	}

	goToConfirmationAccount() {
		this.props.resendCodeValidation(this.props.user.email)
		this.delayedNavigation('Confirmation', 'AccountConfirmation', { origin: 'default' })
	}

	goToAddProduct() {
		this.props.productDetailBySale()
		const isOnTablet = Dimensions.get('window').width >= Breakpoints[Viewports.Tablet]

		this.delayedNavigation(isOnTablet ? 'Products' : 'CurrentSale', 'ProductDetail', {
			screen: 'ProductDetail',
			params: { origin: 'helper' },
		})
	}

	stepNavigate(step) {
		this.delayedNavigation(step.stackName, step.routeName)
	}

	delayedNavigation(stackName, routeName, params) {
		this.timer = setTimeout(() => {
			NavigationService.navigate(stackName, routeName, params)
			NavigationService.closeDrawer()
		}, 350)
		this.hideHelper()
	}

	stepAction(step) {
		this.props.setHelperActualStep(step.id)
		const hasPermission = this.checkUserHasPermission()

		// Step specific methods
		switch (step.id) {
			case 'first-product':
				return this.goToAddProduct()
			case 'publish-catalog':
				if (!hasPermission) return this.permissionAlert()
				break
			case 'invite-users':
				return this.inviteUser(hasPermission, step)
		}

		this.stepNavigate(step)
	}

	stepsList() {
		const { helper } = this.props
		const { contentHeight, helperType } = this.state

		let stepHeight
		const itemsLine = helper.steps?.length / 2
		const minHeightBox = 150
		const isGuided = helperType === 'guided'
		const type = (step) => (isGuided ? guidedStepState(step, helper.steps) : unguidedStepState(step, helper.steps))
		const isBiggestScreen = contentHeight > minHeightBox * itemsLine

		{
			isBiggestScreen && (stepHeight = parseInt(contentHeight / itemsLine))
		}

		return helper.steps?.map((step) => (
			<HelperStep
				height={stepHeight}
				key={step.id}
				status={type(step)}
				state={this.state[type(step)]}
				step={step}
				onPress={this.stepAction.bind(this)}
			/>
		))
	}

	setTileHeight(event) {
		const { height } = event.nativeEvent.layout
		this.setState({ contentHeight: height })
	}

	hideHelper() {
		this.props.toggleHelperVisibility(false)
	}

	openIntercom() {
		this.props.updateIntercomUserData()
		Intercom.present()
	}

	stopShowingHelper() {
		this.hideHelper()
		this.props.updateHelperState(0)
	}

	renderSubscribeButton() {
		const spacing = { marginBottom: 10 }

		return (
			<ActionButton
				style={spacing}
				onPress={() => {
					this.hideHelper()
					setTimeout(() => {
						this.props.toggleBlockManagePlan()
					}, 500)
				}}
			>
				{`${I18n.t('plansAndPrices.seePlansAndPrices')}`}
			</ActionButton>
		)
	}

	render() {
		const { helper, user, billing } = this.props
		const badgeInfo = user.displayName.substring(0, 2).toUpperCase()
		const firstSaleCompleted = helper.steps?.find?.((s) => s?.id === 'first-sale')?.completed
		const { isOwner } = checkUserPermission(user.permissions)
		const showSubscribeBtn =
			(isFree(billing) || isTrial(billing) || isPro(billing) || isGrow(billing)) && firstSaleCompleted && isOwner

		return (
			<KyteModal
				bottomPage
				height={SMALL_SCREENS ? (showSubscribeBtn ? '100%' : '95%') : showSubscribeBtn ? '95%' : '90%'}
				isModalVisible={helper.isVisible}
				topRadius={20}
				hideModal={() => this.hideHelper()}
				coverScreen={false}
			>
				<View style={styles.header}>
					<UserProgress
						onPress={this.hideHelper.bind(this)}
						label={badgeInfo}
						labelSize={SMALL_SCREENS ? 12 : 16}
						size={SMALL_SCREENS ? 20 : 26}
						percent={helper.completionPercentage}
						border={3}
					/>
					<KyteText marginLeft={15} weight="Medium" size={18} {...generateTestID('title-hp')}>
						{I18n.t('expressions.letsGetStarted')}
					</KyteText>
					<TouchableOpacity
						style={styles.closeIconContainer}
						onPress={() => {
							logEvent('Helper Close')
							this.hideHelper()
						}}
					>
						<CenterContent style={styles.closeIcon}>
							<KyteIcon name="close-navigation" size={12} />
						</CenterContent>
					</TouchableOpacity>
				</View>
				<View style={styles.stepsContainer} onLayout={this.setTileHeight.bind(this)}>
					<View style={{ flex: 1 }}>
						<ScrollView>
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
								}}
							>
								{this.stepsList()}
							</View>
						</ScrollView>
					</View>
				</View>
				<View style={styles.bottomContent}>
					<TextButton
						onPress={() => this.stopShowingHelper()}
						title={I18n.t('expressions.stopShowing')}
						color={colors.actionColor}
						size={14}
					/>
					<TextButton
						onPress={() => this.openIntercom()}
						title={I18n.t('expressions.needHelp')}
						color={colors.actionColor}
						size={14}
					/>
				</View>
				{showSubscribeBtn ? this.renderSubscribeButton() : null}
			</KyteModal>
		)
	}
}

const contentPadding = 5

const styles = {
	bottomContent: {
		paddingHorizontal: contentPadding * 2,
		paddingVertical: SMALL_SCREENS ? contentPadding : contentPadding * 2,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	stepsContainer: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	header: {
		position: 'relative',
		paddingHorizontal: contentPadding * 2,
		paddingTop: contentPadding * 3,
		flexDirection: 'row',
		alignItems: 'center',
	},
	closeIconContainer: {
		position: 'absolute',
		right: contentPadding * 2,
		top: contentPadding * 3,
	},
	closeIcon: {
		backgroundColor: colors.littleDarkGray,
		width: 30,
		height: 30,
		borderRadius: 15,
	},
}

const mapStateToProps = ({ onboarding, products, auth, common, billing }) => ({
	helper: onboarding.helper,
	products: products.list,
	user: auth.user,
	isOnline: common.isOnline,
	billing,
})

export default connect(mapStateToProps, {
	toggleHelperVisibility,
	setHelperActualStep,
	productDetailBySale,
	updateHelperState,
	resendCodeValidation,
	checkPlanKeys,
	toggleBlockManagePlan,
	updateIntercomUserData,
})(Helper)
