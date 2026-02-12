import React from 'react';
import { connect } from 'react-redux';
import { View, Text, Platform } from 'react-native';
import moment from 'moment/min/moment-with-locales';
import { find } from 'lodash';
import { Container, colors as UIColors, Row, Margin } from '@kyteapp/kyte-ui-components';
import { bindActionCreators } from 'redux';
import { CenterContent, CurrencyText, GatewayLogo, KyteIcon, KyteText, TextButton, PaymentLinkToCopy, KyteTagNew, KyteButton } from '../../common';
import { Type, colors } from '../../../styles';
import { PaymentType, OrderStatus, SaleOrigin } from '../../../enums';
import I18n from '../../../i18n/i18n';
import { receiptTaxesLabel, checkUserPermission, truncateNoRounding, setOrderIcon, checkSalePaid, renderShippingValue } from '../../../util';
import { mountPaymentLink } from '../../../stores/actions';
import { DiscountCouponTag } from '../../coupons/DiscountCouponTag';

const Strings = {
  t_free_price: I18n.t("plansAndPrices.freeLabel"),
  t_coupon: I18n.t("coupons.coupon")
}

const DetailPayments = (props) => {
  const { sale, mountPaymentLink, handlePressShareButton } = props;
  const { payments, totalGross, discountValue, discountPercent, totalTaxes, totalNet, totalProfit, taxes, totalPay, payBack, shippingFee } = sale;
  const tax = !!taxes && taxes.length > 0 ? taxes[0] : null;
  const haveTimeline = sale.timeline.length;
  const tlLast = sale.isCancelled ? sale.timeline.length - 2 : sale.timeline.length - 1;
  const showTl = haveTimeline && tlLast >= 0;
  const permissions = checkUserPermission(props.userPermissions);
  const paid = OrderStatus.items[OrderStatus.PAID].status;
  const awaitingPayment = OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status;
  const dollarSign = (s) => s === paid || s === awaitingPayment;
  const mainTimeline = sale.isCancelled ? sale.timeline.slice(0, sale.timeline.length - 1) : sale.timeline;
  const hasPaidInTimeline = !!find(mainTimeline, m => m.status === OrderStatus.items[OrderStatus.PAID].status);
  const isFromCatalog = sale.origin === SaleOrigin.CATALOG;
  const totalCouponDiscount = sale?.totalCouponDiscount
  const appliedCoupon = sale?.appliedCoupon
    

  const discountInfo = () => (
    <Text style={!haveTimeline ? styles.oldInfoTexts(colors.errorColor) : styles.infoTexts(colors.errorColor)}>
      {`${I18n.t('words.s.discount')}: `}
      {`(${discountPercent}%) `}
      <CurrencyText value={discountValue} />
    </Text>
  );
  const couponInfo = () => (
    <Text style={!haveTimeline ? styles.oldInfoTexts(colors.errorColor) : styles.infoTexts(colors.errorColor)}>
      {`${Strings.t_coupon}: (${appliedCoupon?.code || appliedCoupon?.name}) -`}
      <CurrencyText value={totalCouponDiscount} />
    </Text>
  );

  const profitInfo = () => (
      <KyteText size={14} pallete={totalProfit >= 0 ? 'actionColor' : 'errorColor'} marginTop={10}>
        {`${I18n.t('statisticProfits')}: `}
        <CurrencyText value={totalProfit} />
      </KyteText>
    );

  const renderDefaultCurrencyInfo = (label, value) => (
    <Text style={!haveTimeline ? styles.oldInfoTexts() : styles.infoTexts()}>
      {label}
      {!Number.isNaN(parseFloat(value)) && Number.isFinite(value) ?   <CurrencyText value={value} /> : value}
    </Text>
  );

  const renderSubtotal = () => renderDefaultCurrencyInfo(`${I18n.t('words.s.subtotal')}: `, totalGross);
  const renderShippingFeeInfo = () => {
    const shippingCouponDiscount = sale?.shippingCouponDiscount;

    return (
      <Container alignItems="flex-end">
        <Text style={!haveTimeline ? styles.oldInfoTexts() : styles.infoTexts()}>
          {`${I18n.t('words.s.delivery')} (${shippingFee.name}): `}
          {renderShippingValue({
            shippingFee: shippingFee?.value,
            shippingCouponDiscount,
            renderCurrency: (value) => <CurrencyText value={value} /> 
          })}
        </Text>
        {!!shippingCouponDiscount && (
          <Container marginTop={8} flexDirection="row" alignItems="center" justify="center">
            <Text style={[!haveTimeline ? styles.oldInfoTexts() : styles.infoTexts(), { paddingTop: 0 }]}>
              {`${I18n.t('coupons.coupon')}: `}
            </Text>
            <DiscountCouponTag title={appliedCoupon?.code || appliedCoupon?.name} />
          </Container>
          
        )}
      </Container>
    
    )
  };
  const taxesInfo = () => renderDefaultCurrencyInfo(receiptTaxesLabel(tax), truncateNoRounding(totalTaxes));

  const renderInfo = () => (
    <View>
      <View style={{ alignItems: 'flex-end', marginVertical: 10 }}>
        {renderSubtotal()}
        {discountValue ? discountInfo() : null}
        {!!totalCouponDiscount && couponInfo()}
        {totalTaxes && tax ? taxesInfo() : null}
        {shippingFee ? renderShippingFeeInfo() : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[Type.Medium, { color: colors.secondaryBg, fontSize: 16 }]}>
          {`${I18n.t('words.s.total')}: `}
          <CurrencyText value={totalNet} />
        </Text>
        {(permissions.isAdmin) ? profitInfo() : null}
      </View>
    </View>
  );

  const renderAwaitPaymentInfo = () => {
    const isPaid = checkSalePaid(sale);
    if (isPaid) return;

    return (
      <View style={styles.chosenInfo}>
        <KyteText pallete="grayBlue" weight="Medium" size={13}>{I18n.t('PaymentMethodChosenLabel').toUpperCase()}</KyteText>
        <PaymentLinkToCopy sale={sale} link={mountPaymentLink(sale.paymentLink)} maxWidth={250} />
      </View>
    );
  };

  const renderCatalogChosenPayment = () => {
    const paymentType = PaymentType.items[payments[0]?.type];

    return (
      <View style={styles.chosenInfo}>
          <KyteText pallete="grayBlue" weight="Medium" size={13}>{I18n.t('PaymentMethodChosenLabel').toUpperCase()}</KyteText>
          <View style={styles.chosenLabel}>
            {renderPaymentIcon(paymentType, null, 16)}
            <KyteText marginLeft={10} weight="Medium" pallete="primaryDarker" size={13}>
              {paymentType.description}
              {payBack ? ` (${I18n.t('expressions.changeFor')} ` : null}
              {payBack ? <CurrencyText value={totalPay} /> : null}
              {payBack ? ')' : null}
            </KyteText>
          </View>
      </View>
    );
  };

  const renderTotalIcon = (backgroundColor = colors.secondaryBg) => (
    <View style={{
        backgroundColor,
        width: 6,
        height: 6,
        borderRadius: 100,
        marginBottom: 7,
        marginTop: 4
      }}
    />
  );

  const renderTimelineIcons = (labels) => (
    <KyteIcon name={labels?.icon} style={{ marginVertical: Platform.OS === 'ios' ? 5 : 10 }} color={labels?.iconColor} size={labels?.iconSize || 15} />
  );

  const renderTimelineLine = (flex = 1) => (
    <View style={{ flex, backgroundColor: colors.grayBlue, width: 1 }} />
  );

  const statusLabels = (tl) => {
    const Capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    if (tl.alias) return { title: Capitalize(tl.alias), icon: setOrderIcon(tl.status), iconColor: tl.color, iconSize: dollarSign(tl.status) ? 18 : null };
    if (tl.status === 'opened') return { title: Capitalize(I18n.t('words.s.pending')), icon: 'clock-stroke-small', iconColor: colors.secondaryBg };
    if (tl.status === 'confirmed') return { title: Capitalize(I18n.t('words.s.confirmed')), icon: 'clock-small', iconColor: colors.actionColor };
    if (tl.status === 'closed') return { title: Capitalize(I18n.t('words.s.sale')), icon: 'check', iconColor: colors.actionColor };
    if (tl.status === 'canceled') return { title: I18n.t('words.s.canceled'), icon: 'cancel-sale', iconColor: colors.errorColor, iconSize: 20 };
    if (tl.status === 'kyte-paid') return { title: I18n.t('defaultStatus.paid'), icon: 'dollar-sign', iconColor: colors.actionColor, iconSize: 20 };
  };

  const renderGroup = (tl, i) => {
    const labels = statusLabels(tl);
    const isLast = i === tlLast;
    const isPayment = tl.status === OrderStatus.items[OrderStatus.PAID].status;
    const isClosed = tl.status === 'closed';
    const isOpened = tl.status === OrderStatus.items[OrderStatus.OPENED].status;
    const isAwaitingPayment = tl.status === awaitingPayment;
    const isPaid = checkSalePaid(sale);
    const isQRCodeGenerated = Boolean(sale.qrCode);

    return (
      <View style={styles.groupView} key={i}>
        <View style={styles.infoView(isLast ? 0 : 15)}>
          <Text style={styles.groupTitle(tl.status === 'canceled' ? colors.errorColor : colors.secondaryBg)}>
            {labels?.title}
          </Text>
          <Text style={styles.groupSubtitle}>
            {moment(tl.timeStamp).format('L LT')}
          </Text>
          {isAwaitingPayment && isQRCodeGenerated && (
            <Row style={styles.chosenInfo} alignItems="center">
              <KyteIcon name="pix" size={20} color={colors.grayBlue} />
              <Margin right={8} />  
              <KyteText pallete="grayBlue" weight={500} size={13}>QR Code gerado</KyteText>
            </Row>
          )}
          {(isFromCatalog && payments.length && isOpened && !isPaid) ? renderCatalogChosenPayment(sale.payBack) : null}
          {(isAwaitingPayment && sale.paymentLink) ? renderAwaitPaymentInfo() : null}
          {isPayment || (!isPayment && !hasPaidInTimeline && isClosed) ? renderPayments() : null}
          {isLast ? renderInfo() : null}
        </View>
        <View style={styles.timelineView()}>
          {renderTimelineIcons(labels)}
          {renderTimelineLine()}
          {isLast ? renderTotalIcon() : null}
        </View>
      </View>
    );
  };

  const renderPaymentIcon = (paymentType, style, size = 20) => {
    const icon = paymentType.type === PaymentType.PIX ? 'pix' : paymentType.icon

    return (
      <KyteIcon
        name={icon}
        size={size}
        color={paymentType.iconColor || colors.secondaryBg}
        style={style}
    />
  )};

  const renderPaymentWithTransaction = (payment, isSplit) => {
    const paymentType = PaymentType.items[payment.type];
    return (
      <CenterContent flexDirection="row" style={{ paddingVertical: 5 }}>
        <CenterContent alignItems="flex-end">
          <View style={styles.transactionInfo}>
            <GatewayLogo
              gateway={payment.transaction.gateway}
              resizeMode={payment.transaction.gateway === 'stripe-connect' ? 'contain' : null}
            />
            <View style={styles.separator} />
            <View style={styles.transactionPaymentType}>
              {renderPaymentIcon(paymentType, { paddingLeft: 1 })}
              <KyteText size={13} style={{ paddingLeft: 7 }}>{paymentType.description}</KyteText>
              <TextButton
                title={` (#${payment.transaction.transactionId.substring(0, 15)})`}
                onPress={() => props.copyToClipboard(payment.transaction.transactionId)}
                color={colors.actionColor}
                weight="Medium" size={12}
                noPadding
              />
              <KyteText size={13}>{`${isSplit ? ':' : ''}`}</KyteText>
            </View>
          </View>
        </CenterContent>
        {isSplit ? <KyteText style={{ paddingLeft: 5 }}><CurrencyText value={payment.totalPaid} /></KyteText> : null}
      </CenterContent>
    );
  };

  const renderPaymentWithoutTransaction = (payment, isSplit) => {
    const paymentType = PaymentType.items[payment.type];
    return (
      <CenterContent flexDirection="row" style={{ paddingVertical: 5 }}>
        {renderPaymentIcon(paymentType, { paddingRight: 5 })}
        <KyteText weight="Regular" size={12} pallete="secondaryBg">
          {paymentType.description}{`${isSplit ? ':' : ''}`}
        </KyteText>
        {isSplit ? <KyteText style={{ paddingLeft: 5 }}><CurrencyText value={payment.totalPaid} /></KyteText> : null}
      </CenterContent>
    );
  };

  const renderPayments = () => {
    const isSplit = payments.length > 1;
    return payments.map((payment, i) => {
      const hasTransaction = !!payment.transaction;
      return (
        <View style={styles.groupView} key={i}>
          <View style={styles.infoView(0, 5)}>
            {hasTransaction ? renderPaymentWithTransaction(payment, isSplit) : renderPaymentWithoutTransaction(payment, isSplit)}
          </View>
        </View>
      );
    });
  };

  const renderGroupCanceled = (tl) => {
    const labels = { title: I18n.t('words.s.canceled'), icon: 'cancel-sale', iconColor: colors.errorColor, iconSize: 20 };
    return (
      <View style={styles.groupView}>
        <View style={styles.infoView(0, 30)}>
          <Text style={styles.groupTitle(colors.errorColor)}>
            {labels.title}
          </Text>
          <Text style={styles.groupSubtitle}>
            {moment(tl.timeStamp).format('L LT')}
          </Text>
        </View>
        <View style={styles.timelineView(17)}>
          {renderTimelineLine()}
          {renderTimelineIcons(labels)}
        </View>
      </View>
    );
  };

  const renderTimeline = (timeline) => timeline.map((tl, i) => renderGroup(tl, i));
  const containerStyle = { paddingVertical: 25, paddingHorizontal: 15 };

  const renderShareBox = () => (
      <Container backgroundColor={UIColors.gray10} padding={16} borderRadius={8}>
        <Row>
          <KyteText weight={500} size={18}>
              {I18n.t("shareStatus")}
            </KyteText>
            <Margin right={4} />
            <KyteTagNew />
        </Row>
        <Margin top={4} />
        <KyteText size={14}>
          {I18n.t("allowShareStatus")}
        </KyteText>
        <Margin top={16} />
        <KyteButton onPress={() => handlePressShareButton()} height={36} background={UIColors.green03Kyte}>
          <KyteText size={14} color={colors.white} weight={500}>{I18n.t('words.s.share')}</KyteText>
          <Margin right={6} />
          <KyteIcon name="share" size={20} color={colors.white} />
        </KyteButton>
      </Container>
    )

  return (
    <View style={containerStyle}>
      {renderShareBox()}
      {renderTimeline(mainTimeline)}
      {showTl && sale.isCancelled ? renderGroupCanceled(sale.timeline[sale.timeline.length - 1]) : null}
    </View>
  );
};

const styles = {
  infoTexts: (color = colors.secondaryBg) => ({
      ...Type.Regular,
      color,
      fontSize: 14,
      paddingTop: 5,
    }),
  oldInfoTexts: (color = colors.secondaryBg) => ({
      ...Type.Regular,
      color,
      fontSize: 14,
      paddingTop: 8,
    }),
  groupView: {
    flexDirection: 'row',
  },
  infoView: (marginBottom = 0, paddingTop = 0) => ({
      flex: 1,
      alignItems: 'flex-end',
      marginBottom,
      paddingTop
    }),
  groupTitle: (color = colors.secondaryBg) => [
      Type.Medium,
      { fontSize: 17, color, paddingTop: 5 },
    ],
  groupSubtitle: [Type.Regular, { fontSize: 14, color: colors.grayBlue, paddingTop: 5 }],
  timelineView: (paddingBottom = 0) => ({
      width: 30,
      paddingLeft: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom,
    }),
  separator: {
    height: 20,
    width: 1,
    backgroundColor: colors.disabledIcon,
    marginHorizontal: 5,
  },
  transactionInfo: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  transactionPaymentType: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  chosenInfo: {
    marginTop: 15,
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  chosenLabel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightBg,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
};

const mapStateToProps = (state) => ({
	store: state.auth.store,
})

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      mountPaymentLink,
    },
    dispatch
  ),
})

export default connect(mapStateToProps, mapDispatchToProps)(DetailPayments);
