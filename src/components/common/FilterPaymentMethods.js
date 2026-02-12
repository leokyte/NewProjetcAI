import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { CheckItem } from ".";
import { PaymentType, toList } from '../../enums';
import { getIsBRAndUseBRL } from '../../util';

class FPM extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      payments: FPM.getFilteredPayments(props),
    };
  }

  static getFilteredPayments(props) {
    const { allowPayLater, currency } = props;
    const isBR = getIsBRAndUseBRL(currency);

    return toList(PaymentType).filter((p) => {
      const isPayLaterAllowed = allowPayLater || p.type !== PaymentType.PAY_LATER;
      const isNotLink = p.type !== PaymentType.LINK;
      const isNotPixIfNotBR = isBR || p.type !== PaymentType.PIX;

      return isPayLaterAllowed && isNotLink && isNotPixIfNotBR;
    });
  };

  renderCheckBox(p) {
    const { paymentMethods, onPress } = this.props;
    
    return (
      <View style={styles.paymentMethodContainer} key={p.type}>
        <CheckItem
          title={p.description}
          checked={paymentMethods.indexOf(p.type) >= 0}
          onPress={() => onPress(p.type)}
        />
      </View>
    );
  }

  render() {
    const { payments } = this.state;

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {payments.map((p) => this.renderCheckBox(p))}
      </View>
    );
  }
}

const styles = {
  paymentMethodContainer: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBox: {
    marginRight: 5,
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 3,
    width: 20,
    height: 20,
  },
};

const mapStateToProps = ({ preference }) => ({
  allowPayLater: preference.account.allowPayLater,
  currency: preference.account.currency,
});

const FilterPaymentMethods = connect(mapStateToProps)(FPM);

export { FilterPaymentMethods };
