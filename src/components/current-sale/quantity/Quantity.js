import React, { Component } from 'react';
import { View, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import { ActionButton, Calculator, KyteToolbar, KyteButton, KyteIcon, KyteSafeAreaView, KyteText } from '../../common';
import { scaffolding, colors, colorSet, Type } from '../../../styles';
import I18n from '../../../i18n/i18n';
import { generateTestID } from '../../../util';

class Quantity extends Component {
  constructor(props) {
    super(props);
    const { params = {} } = this.props.route;
    const { productQuantity } = params;

    this.state = {
      initialQuantity: productQuantity || 1,
      quantity: 0,
      touched: false,
    };
  }

  componentWillUnmount() {
    const { params = {} } = this.props.route;
    if (params.onUnmount) {
      params.onUnmount();
    }
  }

  showHelpMessage() {
    Alert.alert(
      '',
      I18n.t('quantityAlertDescription'),
      [{ text: I18n.t('alertOk') }]
    );
  }

  insertQuantity() {
    const { params = {} } = this.props.route;
    const { goBack } = this.props.navigation;
    params.setQuantity(this.quantityValue);
    goBack();
  }

  touchedCalculator() {
    this.setState({ touched: true });
  }

  incrementQuantity(operation) {
    const { touched } = this.state;

    const value = operation === 'increase' ? ++this.quantityValue : --this.quantityValue;
    this.setState({ [touched ? 'quantity' : 'initialQuantity']: value });
  }

  renderSellingInfo() {
    const pluralUnit = this.quantityValue > 1 ? 's' : '';
    return (
      <Text allowFontScaling={false} style={[Type.Regular, colorSet(colors.primaryColor), Platform.select({ ios: { paddingBottom: 25 } })]}>
        {`${I18n.t('words.s.sell')} ${this.quantityValue} ${I18n.t('words.s.unit')}${pluralUnit} ${I18n.t('quantityUnitHelper')}`}
      </Text>
    );
  }

  renderHelpInfo() {
    return <KyteText>{I18n.t('addAValue')}</KyteText>;
  }

  render() {
    const { touched, quantity, initialQuantity } = this.state;
    const { outerContainer, bottomContainer } = scaffolding;
    const { topContainer, valueContainer, quantityContainer, incrementButton } = styles;
    const { goBack } = this.props.navigation;
    const maximumValue = 9999;
    this.quantityValue = touched ? quantity : initialQuantity;


    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={I18n.t('quantityPageTitle')}
          goBack={() => goBack()}
        />
        <View style={topContainer}>
          {this.quantityValue ? this.renderSellingInfo() : this.renderHelpInfo()}
          <View style={quantityContainer}>
            <KyteButton
              disabled={this.quantityValue <= 1}
              onPress={() => this.incrementQuantity('decrease')}
              width={60}
              height={50}
              style={incrementButton}
              testProps={generateTestID('dec-qck')}
            >
              <KyteIcon
                name={'minus-cart'}
                size={25}
                color={colors.secondaryBg}
              />
            </KyteButton>
            <TouchableOpacity style={valueContainer} onPress={() => this.showHelpMessage()} activeOpacity={0.8}>
              <KyteText weight={'Light'} size={48} pallete={'actionColor'}>
                {this.quantityValue}
              </KyteText>
            </TouchableOpacity>
            <KyteButton
              disabled={this.quantityValue > maximumValue}
              onPress={() => this.incrementQuantity('increase')}
              width={60}
              height={50}
              style={incrementButton}
              testProps={generateTestID('add-qck')}
            >
              <KyteIcon
                name={'plus-cart'}
                size={25}
                color={colors.secondaryBg}
              />
            </KyteButton>
          </View>
        </View>
        <View style={{ flex: 1.5 }}>
          <Calculator
            state={this}
            stateProp={touched ? 'quantity' : 'initialQuantity'}
            stateValue={this.quantityValue}
            onPressNumber={() => this.touchedCalculator()}
            getPressedNumber={!touched ? (number) => this.setState({ quantity: number }) : null}
            disablePress={this.quantityValue > maximumValue}
            noConfirm
          />
        </View>
        <View style={bottomContainer}>
          <ActionButton
            alertDescription={I18n.t('quantityAlertDescription')}
            onPress={() => this.insertQuantity()}
            disabled={!this.quantityValue}
            testProps={generateTestID('ok-qck')}
          >
            {'OK'}
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
    flexDirection: 'column',
    backgroundColor: colors.lightBg,
  },
  valueContainer: {
    flexDirection: 'row',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    ...Platform.select({
      ios: {
        height: 40,
      },
    }),
  },
  quantityContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  }
};

export default Quantity;
