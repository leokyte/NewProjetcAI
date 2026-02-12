import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Alert, Platform } from 'react-native';
import { MaskService } from 'react-native-masked-text';
import { Calculator, KyteToolbar, TextButton, TextCursor, ActionButton, KyteSafeAreaView } from '../../common';
import { scaffolding, colors, colorSet, Type } from '../../../styles';
import I18n from '../../../i18n/i18n';
import { generateTestID } from '../../../util';

class QuantityFractioned extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fraction: ''
    };
  }

  showFractionHelper() {
    const { exampleOne, exampleTwo, exampleThree } = I18n.t('quantityFractionedExamples');
    Alert.alert(
      I18n.t('quantityFractionedAlertTitle'),
      `${exampleOne}\n${exampleTwo}\n${exampleThree}\n\n${I18n.t('quantityFractionedAlertDescription')}`,
      [
        { text: I18n.t('alertOk') }
      ]
    );
  }

  AddFractionedProduct() {
    const { params = {} } = this.props.route;
    const { goBack } = this.props.navigation;
    params.SaleAddProduct(params.products, this.state.fraction);
    goBack();
  }

  render() {
    const { outerContainer, bottomContainer } = scaffolding;
    const { topContainer, valueContainer, helpButton } = styles;
    const { fraction } = this.state;
    const { params = {} } = this.props.route;
    const { goBack } = this.props.navigation;
    const { groupingSeparator, decimalSeparator } = this.props.currency;

    const isEmpty = fraction === '0.000' || fraction === '';
    const valueToFormat = isEmpty ? 0.000 : fraction;
    const formattedValue = MaskService.toMask(
      'money',
      Number(valueToFormat),
      {
        unit: '',
        separator: decimalSeparator,
        delimiter: groupingSeparator,
        precision: 3
      }
    );

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={`${I18n.t('quantityFractionedPageTitle')} ${params.products.name}`}
          goBack={() => goBack()}
        />
        <View style={topContainer}>
          <Text allowFontScaling={false} style={[Type.Regular]}>
            {I18n.t('quantityHelper')}
          </Text>
          <View style={valueContainer}>
            <Text
              style={[
              Type.Light,
              Type.fontSize(32),
              colorSet(colors.primaryColor)
            ]}
            {...generateTestID('input-qps')}
            >
              {formattedValue}
            </Text>
            <TextCursor
              cursorStyle={[
                Type.Light,
                Type.fontSize(32),
                colorSet(colors.primaryColor),
                { lineHeight: 32, paddingTop: 3 }
              ]}
            />
          </View>
          <TextButton
            style={helpButton}
            title={I18n.t('quantityFractionedHelpButton')}
            color={colors.actionColor} size={14}
            onPress={() => this.showFractionHelper()}
            testProps={generateTestID('help-qps')}
          />
        </View>
        <View style={{ flex: 1.5 }}>
          <Calculator
            state={this}
            stateProp={'fraction'}
            stateValue={fraction ? fraction.substring(0, 8) : fraction}
            noConfirm
            valueType='decimal'
            valuePrecision={3}
          />
        </View>
        <View style={bottomContainer}>
          <ActionButton
            onPress={() => this.AddFractionedProduct()}
            alertDescription={I18n.t('addAValue')}
            disabled={isEmpty}
            testProps={generateTestID('send-to-cart-qps')}
          >
            {I18n.t('sendToCart')}
          </ActionButton>
        </View>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  valueContainer: {
    width: '50%',
    alignItems: 'center',
    marginTop: 30,
    borderBottomWidth: 2,
    borderColor: colors.actionColor,
    ...Platform.select({
      ios: {
        height: 35,
      }
    }),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  helpButton: {
    marginTop: 20
  }
};
const mapStateToProps = ({ preference }) => ({ currency: preference.account.currency });

export default connect(mapStateToProps)(QuantityFractioned);
