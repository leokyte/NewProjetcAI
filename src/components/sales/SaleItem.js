import React, { useEffect, useMemo, useState } from 'react'
import { View, TouchableOpacity, Dimensions, Platform, Text, Animated, Easing } from 'react-native'
import moment from 'moment/min/moment-with-locales'
import { connect } from 'react-redux'
import { CurrencyText, KyteIcon, KyteText, CustomerOrderTag, GatewayLogo } from '../common'
import I18n from '../../i18n/i18n'
import { setOrderIcon, buildItemsNames } from '../../util'
import { colors } from '../../styles'
import { PaymentType, SaleOrigin, OrderStatus } from '../../enums'
import { KyteIcon as Icon, Margin } from '@kyteapp/kyte-ui-components'
import { checkHasNeverBeenOnServer } from '../../util/util-sync'
import SpinAnimation from '../common/utilities/SpinAnimation'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

const SaleItem = ({ sale, dailyTotal, isLast, hideCustomerTag, expandedItems, auth, onPress, isSyncing }) => {
	const { itemContainer, productCode, periodStyle, mainContent } = styles

	const [tooltipVisible, setTooltipVisible] = useState(false)

	const paymentFirst = sale.payments?.[0]
	const salePaymentType = paymentFirst ? paymentFirst?.type : 0
	const splitPayment = sale.payments?.length > 1
	const singlePaymentIcon = PaymentType.items[salePaymentType]?.icon ?? ''
	const splitPaymentIcon = 'split'
	const isPayLater = splitPayment || !sale.payments?.length ? false : sale.payments?.[0].type === PaymentType.PAY_LATER
	const payment = useMemo(() => sale.payments?.find?.((p) => p.transaction), [sale.payments])
	const confirmed = OrderStatus.items[OrderStatus.CONFIRMED].status
	const status = sale.statusInfo ? sale.statusInfo.status : sale.status

	// Icon Tyoes
	const salePaymentIcon = splitPayment ? splitPaymentIcon : singlePaymentIcon

	// Icon Colors
	const saleIconColor = isPayLater ? colors.barcodeRed : colors.secondaryBg
	const orderIconColor = () => {
		if (sale.isCancelled) return colors.errorColor
		if (sale.statusInfo) return sale.statusInfo.color
		return sale.status === confirmed ? colors.actionColor : colors.secondaryBg
	}

	const isOrder = !(sale.status === 'closed')
	const hasCustomer = sale.customer && !hideCustomerTag
	const hasGateway = !!payment && !!payment.transaction.gateway
	const hasObs = sale.observation
	const hasDiscount = sale.discountValue
	const isFromCatalog = sale.origin === SaleOrigin.CATALOG

	const onPressTooltip = () => {
		if (!isSyncing) {
			setTooltipVisible(!tooltipVisible)
			setTimeout(() => setTooltipVisible(false), 3000)
		}
	}

	const renderCustomerTag = (info) => {
		const calculateWidth = () => {
			if (hasCustomer && !hasGateway && !hasObs && !hasDiscount) {
				return expandedItems ? '100%' : '90%'
			}

			if (expandedItems && hasCustomer && (hasGateway || hasObs || hasDiscount)) {
				return SMALL_SCREENS ? 130 : 180
			}

			return SMALL_SCREENS ? 110 : 135
		}
		const tagStyle = { marginRight: 12, maxWidth: calculateWidth(), justifyContent: 'flex-start' }
		return <CustomerOrderTag text={info} icon={sale.origin === SaleOrigin.CATALOG ? 'person' : null} style={tagStyle} />
	}

	const renderDiscountTag = (info) => {
		// const convertedValue = currencyFormat(info, currency, decimalCurrency);
		return <CustomerOrderTag text="" icon="discount" textColor={colors.secondaryBg} iconColor={colors.secondaryBg} />
	}

	const renderObservationTag = () => {
		return <CustomerOrderTag text="" icon="observation-right" />
	}

	const renderDeliveryIcon = (toDeliver) => {
		const tagText = toDeliver ? I18n.t('words.s.delivery') : I18n.t('words.s.withdrawal')

		return <CustomerOrderTag text={expandedItems ? tagText : ''} icon={toDeliver ? 'pin' : 'store'} />
	}

	const renderUsername = () => {
		if (auth.multiUsers && auth.multiUsers.length > 1) {
			const userName = sale.userName === 'catalog' ? I18n.t('words.s.catalog') : sale.userName
			return <KyteText pallete="grayBlue" weight="Regular">{`${I18n.t('words.s.by')} ${userName}`}</KyteText>
		}
		return null
	}

	const renderSaleNumber = () => {
		if ((auth.multiUsers && auth.multiUsers.length > 1) || sale.did === 'c') {
			return `#${sale.did || 0}-${sale.number}`
		}
		return `#${sale.number}`
	}

	const renderItemsNames = () => {
		if (sale.items?.length >= 3) {
			return `${sale.items?.length} ${
				sale.items?.length > 1 ? I18n.t('words.p.item') : I18n.t('words.s.item')
			}: ${buildItemsNames(sale)}`
		}
		return buildItemsNames(sale)
	}

	const renderGateway = () => {
		return (
			<GatewayLogo
				gateway={payment.transaction.gateway}
				resizeMode={payment.transaction.gateway === 'stripe-connect' ? 'contain' : null}
			/>
		)
	}

	const renderSaleIcon = () => {
		return (
			<KyteIcon
				style={styles.saleIcon}
				name={isOrder ? setOrderIcon(status, sale.isCancelled) : salePaymentIcon}
				size={18}
				color={isOrder ? orderIconColor() : saleIconColor}
			/>
		)
	}

	const renderTooltipSync = () => {
		return (
			<View>
				<View style={styles.tooltip.container}>
					<Text style={styles.tooltip.text}>{I18n.t('orderNotSynced')}</Text>
				</View>
			</View>
		)
	}

	const renderSyncOrderItem = () => (
		<View>
			{tooltipVisible && renderTooltipSync()}
			{isSyncing ? (
				<SpinAnimation shouldSpin>
					<Icon name="sync" style={styles.iconSyncing} />
				</SpinAnimation>
			) : (
				<Icon name="not-sync" style={styles.iconSync} onPress={onPressTooltip} />
			)}
		</View>
	)

	const renderExpandedItem = () => (
		<TouchableOpacity onPress={onPress} activeOpacity={0.8}>
			<View style={itemContainer}>
				<View style={styles.contentLine}>
					{renderSaleIcon()}
					<View style={mainContent}>
						<KyteText
							style={styles.saleValue}
							lineThrough={sale.isCancelled}
							size={14}
							ellipsizeMode="tail"
							numberOfLines={1}
							weight="Semibold"
						>
							<CurrencyText value={sale.totalNet} />
						</KyteText>
						{isFromCatalog ? <KyteIcon style={styles.saleIcon} size={18} name="cart" /> : renderUsername()}
					</View>
					{checkHasNeverBeenOnServer(sale) && <Margin right={5}>{renderSyncOrderItem()}</Margin>}
					<KyteText weight="Semibold" pallete="grayBlue" style={periodStyle}>
						{moment(isOrder ? sale.dateCreation : sale.dateClosed).format('LT')}
					</KyteText>
				</View>

				<View style={styles.contentLine}>
					<KyteText lineThrough={sale.isCancelled} style={mainContent} ellipsizeMode="tail" numberOfLines={1}>
						{renderItemsNames()}
					</KyteText>
					<KyteText style={productCode} pallete="grayBlue">
						{renderSaleNumber()}
					</KyteText>
				</View>

				<View style={styles.contentLine}>
					<View style={[mainContent, styles.contentLine]}>
						{sale.customer && !hideCustomerTag ? renderCustomerTag(sale.customer.name) : null}
						{sale.origin === SaleOrigin.CATALOG ? renderDeliveryIcon(sale.toDeliver) : null}
						{sale.observation ? renderObservationTag() : null}
						{sale.discountValue ? renderDiscountTag(sale.discountValue) : null}
					</View>
					{hasGateway ? renderGateway() : null}
				</View>
			</View>
		</TouchableOpacity>
	)

	const renderTotals = () => {
		const { amount, total, date } = dailyTotal
		const dateView = moment(date).format('dddd, ll')
		const calendarView = moment(date).calendar()
		const containerStyle = { flexDirection: 'row', alignItems: 'center', marginTop: 10 }
		const amountStyle = { marginRight: 10 }
		const twoDaysAgo = moment().subtract(2, 'day')
		const isPastTwoDays = moment(date).isAfter(twoDaysAgo, 'day')
		const amountInfo = (type) => `${amount} ${amount > 1 ? I18n.t(`words.p.${type}`) : I18n.t(`words.s.${type}`)}, `

		const totalValues = () => (
			<View style={containerStyle}>
				<KyteText size={14} weight="Medium" pallete="grayBlue">
					{isOrder ? amountInfo('order') : amountInfo('sale')}
					<CurrencyText value={total} />
				</KyteText>
			</View>
		)

		return (
            <View style={styles.groupHeader}>
                <View style={styles.groupHeaderInner}>
					<KyteText weight="Regular" size={20} style={amountStyle}>
						{isPastTwoDays ? calendarView.replace(/ .*/, '') : dateView}
					</KyteText>
					{amount ? totalValues() : null}
				</View>
            </View>
        );
	}
	return (
		<View>
			{isLast ? renderTotals() : null}
			{renderExpandedItem()}
		</View>
	)
}

const styles = {
	itemContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		borderColor: colors.borderColor,
		borderBottomWidth: 1,
		padding: 15,
	},
	salesDate: {
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	tagStyle: {
		marginRight: 7,
	},
	mainContent: {
		flex: 1,
		paddingRight: 5,
		flexDirection: 'row',
	},
	productCode: { lineHeight: 26 },
	periodStyle: {
		lineHeight: 18,
	},
	notExpandedCustomerContainer: {
		flex: 1,
		flexDirection: 'row',
	},
	groupHeader: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		paddingLeft: 15,
		paddingBottom: 20,
		paddingTop: 35,
	},
	groupHeaderInner: { flex: 1 },
	saleIcon: {
		position: 'relative',
		top: Platform.OS === 'ios' ? -2 : 0,
	},
	saleValue: {
		paddingHorizontal: 10,
	},
	contentLine: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	spaceRight: { marginRight: 10 },
	iconSyncing: {
		color: colors.actionColor,
	},
	iconSync: {
		color: colors.warningColor,
	},
	syncButton: { position: 'relative' },
	tooltip: {
		container: {
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			padding: 5,
			borderRadius: 4,
			position: 'absolute',
			zIndex: 1,
			bottom: 3,
			right: -50,
			width: 180,
		},
		text: {
			color: colors.white,
			textAlign: 'center',
		},
	},
}

const mapStateToProps = ({ auth, preference, sales, sync }, ownProps) => {
	const isOrder = ownProps.salesType === 'order'
	return {
		auth,
		expandedItems: isOrder ? sales.expandedItemsOrders : sales.expandedItemsSales,
		decimalCurrency: preference.account.decimalCurrency,
	}
}

export default connect(mapStateToProps)(SaleItem)
