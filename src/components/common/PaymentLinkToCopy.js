import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TouchableOpacity } from 'react-native';
import Share from 'react-native-share';
import { KyteText, KyteIcon, CenterContent } from './';
import { colors } from '../../styles';
import { isAndroid } from '../../util';
import I18n from '../../i18n/i18n';
import { mountPaymentLink } from '../../stores/actions';

const PaymentLinkToCopy = (props) => {
  // Props
  const { link, maxWidth } = props;

  // Style
  const style = {
    constainer: {
      marginTop: 10,
    },
    paymentLinkStyle: {
      maxWidth, // no problem to be undefined
      backgroundColor: colors.lightBg,
      flexDirection: 'row',
      flex: 0,
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderRadius: 20,
    },
    textStyle: {
      paddingLeft: 8,
      paddingTop: isAndroid ? 0 : 2,
      color: colors.primaryDarker,
    },
  };

  // Aux func
  const shareLink = () => {
    const { store, sale } = props;
    const { paymentLink = '' } = sale;
    const atStore = store.name ? `${I18n.t('words.s.at')} ${store.name}` : '';
    const linkClipboard = props.mountPaymentLink(paymentLink) || null;
    const linkMessage = `${I18n.t('SharePaymentLinkMessage')} #${sale.number} ${atStore} \n ${linkClipboard}`;
    Share.open({
      title: store.name,
      message: linkMessage,
    });
  };

  // Main return
  return (
    <TouchableOpacity onPress={() => shareLink()} style={style.constainer}>
      <CenterContent style={style.paymentLinkStyle}>
        <KyteIcon name={'link'} size={18} color={colors.primaryDarker}/>
        <KyteText style={style.textStyle} weight={'Medium'} numberOfLines={1}>{link}</KyteText>
      </CenterContent>
    </TouchableOpacity>
  );
};

const mapStateToProps = ({ auth }) => ({ store: auth.store });
const mapDispatchToProps = (dispatch) => ({ mountPaymentLink: bindActionCreators(mountPaymentLink, dispatch) });

const C = connect(mapStateToProps, mapDispatchToProps)(PaymentLinkToCopy);
export default React.memo(C);
