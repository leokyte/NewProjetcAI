import React, { Component } from 'react';
import { View, Platform } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import * as RNLocalize from 'react-native-localize';

import { CustomKeyboardAvoidingView, ActionButton, Input, KyteButton, KyteIcon } from './';
import CustomerFlatList from '../customers/common/CustomerFlatList';
import I18n from '../../i18n/i18n';
import { colors, scaffolding } from '../../styles';

import { autocompleteAddress } from '../../util';
import { logEvent } from '../../integrations';

class KyteAddressSearchContainer extends Component {
  constructor(props) {
    super(props);

    const locales = RNLocalize.getLocales();
    this.state = {
      address: props.address || '',
      addressesFound: [],
      locale: locales[0].languageTag,
    };

    this.debounceChangeText = _.debounce((text) => this.onChangeAddressText(text), 800);
  }

  onChangeAddressText(text) {
    const { locale } = this.state;
    autocompleteAddress(text, locale)
      .then((result) => {
        const { items } = result.data;
        let addressesFound = [];
        if (items.length > 0) {
          addressesFound = items.map((i) => ({ address: i.title }));
        }
        this.setState({ addressesFound });
        logEvent('GeocodeAddressSearch', { text, resQtd: items.length });
      })
      .catch(() => this.setState({ addressesFound: [] }));
  }

  searchAddress(address) {
    this.setState({ address });
    this.props.saveAction(address, true);
    if (address.length > 4) {
      this.debounceChangeText(address);
    }
  }

  saveAddress(address) {
    const addressPredicted = address
      ? `${address.address}${address.subtitle ? ` - ${address.subtitle}` : ''}`
      : this.state.address;
    this.props.saveAction(addressPredicted);
  }

  renderAddressesFound() {
    const { addressesFoundContainer } = styles;
    const { address: typedAddres, addressesFound } = this.state;

    const firstOption = typedAddres ? [{ address: typedAddres, subtitle: '' }] : [];

    return (
      <View style={addressesFoundContainer}>
        <CustomerFlatList
          data={firstOption.concat(addressesFound)}
          onPress={(address) => this.saveAddress(address)}
        />
      </View>
    );
  }

  renderSaveButton() {
    const { bottomContainer } = scaffolding;

    return (
      <View style={bottomContainer}>
        <ActionButton
          onPress={() => this.saveAddress()}
          alertTitle=""
          alertDescription={I18n.t('customerSaveAddressAlertDescription')}
        >
          {I18n.t('productSaveButton')}
        </ActionButton>
      </View>
    );
  }

  renderIconClean() {
    const { iconClean } = styles;
    return (
      <KyteButton
        width={40}
        height={27}
        onPress={() => {
          // this.props.dispatch(change('ConfigStoreForm', 'addressModal', ''));
          // this.props.dispatch(change('ConfigStoreForm', 'storeAddress', ''));
        }}
        style={iconClean}
      >
        <KyteIcon name={'close-navigation'} size={10} color={colors.secondaryBg} />
      </KyteButton>
    );
  }

  render() {
    const { container, addressesContainer } = styles;
    const { address } = this.state;
    const { renderRightIcon, isOnline } = this.props;

    return (
      <CustomKeyboardAvoidingView style={container}>
        <View style={{ flex: 1 }}>
          <View style={addressesContainer}>
            <Input
              onChangeText={(address) => this.searchAddress(address)}
              placeholder={I18n.t('customerAddressPlaceholder')}
              placeholderColor={colors.primaryGrey}
              style={Platform.select({ ios: { height: 32 } })}
              autoCapitalize="words"
              error={''}
              returnKeyType="done"
              value={address}
              autoFocus
              autoCorrect
              noBorder
              hideLabel
              displayIosBorder={false}
              rightIcon={renderRightIcon ? this.renderIconClean() : null}
              rightIconStyle={{ position: 'absolute', right: 2 }}
              />
          </View>
          {isOnline ? this.renderAddressesFound() : null}
        </View>
        {!isOnline ? this.renderSaveButton() : null}
      </CustomKeyboardAvoidingView>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  addressesContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  addressesFoundContainer: {
    flex: 1,
    marginTop: 10,
  },
  iconClean: {
    marginLeft: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    top: 1,
  },
};

const mapStateToProps = (state) => {
  return {
    isOnline: state.common.isOnline,
  };
};

const KyteAddressSearch = connect(mapStateToProps)(KyteAddressSearchContainer);
export { KyteAddressSearch };
