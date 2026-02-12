import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, BackHandler } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import Share from 'react-native-share'
import {
	KyteText,
	KyteIcon,
	CenterContent,
	ActionButton,
	DynamicButton,
	KyteSafeAreaView,
	CurrencyText,
	TextButton,
} from '../../common'
import { startToast, saleDetail, generatePaymentLink, mountPaymentLink } from '../../../stores/actions'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { isSmallScreen } from '@kyteapp/kyte-ui-components'
import NavigationService from '../../../services/kyte-navigation'
import { generateTestID } from '../../../util'
import { logEvent } from '../../../integrations'
class PaymentLinkContainer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			linkIsCopied: false,
			linkGenaretate: false,
		}

		this.backHandlerSubscription = null
	}

	componentDidMount() {
		this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton)
		logEvent('Payment Link View')
	}

	componentWillUnmount() {
		clearTimeout(this.timer)
		this.backHandlerSubscription?.remove()
	}

	handleBackButton() {
		return true
	}

	goToOrder() {
		const { navigation, lastSale } = this.props

		navigation.navigate({
			key: 'SaleDetailPage',
			name: 'SaleDetail',
			params: { sale: lastSale, refreshSales: () => null },
		})

		this.props.saleDetail(lastSale)
	}

	shareLink() {
		const { store, lastSale } = this.props
		const { paymentLink = '' } = lastSale
		const atStore = store.name ? `${I18n.t('words.s.at')} ${store.name}` : ''
		const linkClipboard = this.props.mountPaymentLink(paymentLink)
		const linkMessage = `${I18n.t('SharePaymentLinkMessage')} #${lastSale.number} ${atStore} \n ${linkClipboard}`

		logEvent('Payment Link Share')

		Share.open({
			title: store.name,
			message: linkMessage,
		})
	}

	copyLink() {
		const { lastSale } = this.props
		Clipboard.setString(this.props.mountPaymentLink(lastSale.paymentLink))
		this.setState({ linkIsCopied: true })

		logEvent('Payment Link Copy')
		this.timer = setTimeout(() => this.setState({ linkIsCopied: false }), 2000)
		this.props.startToast(I18n.t('fbIntegration.toastCopiedText'))
	}

	generateLink() {
		const { lastSale } = this.props

		this.setState({ linkGenaretate: true })
		const checkLinkGeneration = () => {
			this.timer = setTimeout(() => this.setState({ linkGenaretate: false }), 2000)
		}
		this.props.generatePaymentLink(lastSale, checkLinkGeneration)
	}

	renderSecondaryButton(state, info, method, icon) {
		const iconStyle = { marginLeft: 10 }

		return (
			<DynamicButton
				onPress={() => method()}
				borderColor={colors.grayBlue}
				backgroundColor={state ? colors.grayBlue : 'white'}
				height={28}
				marginTop={20}
				testProps={generateTestID('copy-plo')}
			>
				<KyteText pallete={state ? 'white' : 'tipColor'} size={13} weight={'Medium'}>
					{state ? info.postClick : info.preClick}
				</KyteText>
				{!state ? <KyteIcon style={iconStyle} size={16} name={icon} color={colors.tipColor} /> : null}
			</DynamicButton>
		)
	}

	renderCopyLinkButton() {
		const { linkIsCopied } = this.state

		return this.renderSecondaryButton(
			linkIsCopied,
			{ preClick: I18n.t('expressions.copyLink'), postClick: I18n.t('words.s.copied') },
			this.copyLink.bind(this),
			'copy'
		)
	}

	renderTryAgainButton() {
		const { linkGenaretate } = this.state

		return this.renderSecondaryButton(
			linkGenaretate,
			{ preClick: I18n.t('stockConnectivityStatusButtonIfo'), postClick: I18n.t('words.s.loading') },
			this.generateLink.bind(this),
			'refresh'
		)
	}

	startAnotherSale() {
		const { viewport, navigation } = this.props

		if (isSmallScreen(viewport)) {
			navigation.navigate('CurrentSale')
		} else {
			NavigationService.navigate('CurrentSale', 'ProductSale')
		}
	}

	render() {
		const { lastSale } = this.props
		const { paymentLink } = lastSale
		const linkClipboard = this.props.mountPaymentLink(paymentLink)

		return (
			<KyteSafeAreaView style={styles.container}>
				<CenterContent flexDirection={'column'}>
					<View style={styles.circle()} pallete={'lightBg'}>
						<CenterContent>
							<KyteIcon name={'link'} size={28} />
						</CenterContent>
					</View>
					<KyteText style={styles.bottomSpace} weight={'Light'} size={48} testProps={generateTestID('total-plo')}>
						<CurrencyText value={lastSale.totalNet} />
					</KyteText>
					<KyteText style={styles.bottomSpace} size={12} pallete={'grayBlue'}>
						{I18n.t('paymentLinkUsageTip')}
					</KyteText>
					<KyteText size={14} pallete={'primaryBg'} textAlign={'center'} {...generateTestID('link-plo')}>
						{paymentLink ? linkClipboard : I18n.t('paymentLinkError')}
					</KyteText>
					{paymentLink ? this.renderCopyLinkButton() : this.renderTryAgainButton()}
				</CenterContent>
				<View style={styles.bottomContainer}>
					<TextButton
						style={styles.salesLink(15)}
						onPress={() => this.startAnotherSale()}
						title={I18n.t('receiptConcludeButton')}
						color={colors.actionColor}
						size={14}
						testProps={generateTestID('new-sale-plo')}
					/>
					<ActionButton
						onPress={() => this.goToOrder()}
						style={styles.btnSpace}
						leftIcon={<KyteIcon name={'dollar-sign'} size={20} />}
						cancel
						testProps={generateTestID('view-order-plo')}
					>
						{I18n.t('goToOrder')}
					</ActionButton>
					<ActionButton
						alertDescription={I18n.t('paymentLinkError')}
						disabled={!paymentLink}
						onPress={() => this.shareLink()}
						testProps={generateTestID('share-plo')}
					>
						{I18n.t('expressions.shareLink')}
					</ActionButton>
				</View>
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	container: {
		flex: 1,
	},
	circle: (size = 80) => ({
		borderRadius: size,
		width: size,
		height: size,
		backgroundColor: colors.borderlight,
		marginBottom: 35,
	}),
	salesLink: (marginBottom = 0) => ({
		fontFamily: 'Graphik-Medium',
		alignSelf: 'center',
		fontSize: 16,
		marginBottom,
	}),
	bottomContainer: { paddingVertical: 10 },
	bottomSpace: { marginBottom: 15 },
	btnSpace: { marginBottom: 10 },
}

const mapStateToProps = ({ lastSale, currentSale, auth, common }) => ({
	lastSale,
	currentSale,
	store: auth.store,
	viewport: common.viewport,
})
export default connect(mapStateToProps, { startToast, saleDetail, generatePaymentLink, mountPaymentLink })(
	PaymentLinkContainer
)
