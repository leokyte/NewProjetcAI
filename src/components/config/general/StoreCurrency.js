import React, { Component } from 'react';
import { connect } from 'react-redux';
import accents from 'remove-accents';
import { View, FlatList } from 'react-native';
import { SearchBar, DetailPage } from '../../common';
import { preferenceSetCountryCode } from '../../../stores/actions';
import { kyteAccountGetCountries } from '../../../services';
import LoadingScreen from '../../common/LoadingScreen';
import CurrencyItem from './CurrencyItem';
import I18n from '../../../i18n/i18n';
import { logEvent } from '../../../integrations';

class StoreCurrency extends Component {
  static navigationOptions = () => ({
    header: null,
  });

  state = {
    isSearchBarVisible: false,
    currencies: [],
    filteredCurrencies: '',
    loading: true,
  };

  componentDidMount() {
    kyteAccountGetCountries(I18n.t('locale'))
      .then((res) => {
        this.setState({
          currencies: res.data,
          loading: false,
        });
      })
      .catch((ex) => {
        const errorMessage = ex.message ? ex.message : 'No error message provided.';
        logEvent('StoreGetCountriesError', { error: errorMessage });
      });
  }

  defineCurrency(item) {
    const { goBack } = this.props.navigation;
    this.props.preferenceSetCountryCode(item.code, item.currencyCode);
    goBack();
  }

  searchCurrencies(text) {
    const { currencies } = this.state;
    const normalizeString = (str) => accents.remove(str.toLowerCase());

    const filteredCurrencies = currencies.filter((currency) => {
      if (currency.currencyName) {
        if (normalizeString(currency.currencyName).match(normalizeString(text))) return true;
        else if (normalizeString(currency.name).match(normalizeString(text))) return true;
        else return false;
      }
    });
    this.setState({ filteredCurrencies });
  }

  toggleSearch() {
    const { isSearchBarVisible } = this.state;
    this.setState({ isSearchBarVisible: !isSearchBarVisible });
  }

  closeSearch() {
    this.setState({ isSearchBarVisible: false });
    this.searchCurrencies('');
  }

  renderSearchBar() {
    return (
      <SearchBar
        isOpened={this.state.isSearchBarVisible}
        openedPlaceholder={I18n.t('configCurrencySearchPlaceholderActive')}
        closedPlaceholder={I18n.t('configCurrencySearchPlaceholder')}
        toggleSearch={this.toggleSearch.bind(this)}
        closeSearchAction={this.closeSearch.bind(this)}
        searchAction={this.searchCurrencies.bind(this)}
      />
    );
  }

  renderCurrencies() {
    const { currencies, filteredCurrencies } = this.state;
    const list = filteredCurrencies || currencies;

    return (
      <FlatList
        data={list}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <CurrencyItem
            key={item.code}
            code={item.code}
            name={item.currencyName}
            onPress={() => this.defineCurrency(item)}
          />
        )}
      />
    );
  }

  renderLoading() {
    return <LoadingScreen reverseColor hideLogo description={I18n.t('configCurrencyLoading')} />;
  }

  renderContent() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderSearchBar()}
        {this.renderCurrencies()}
      </View>
    );
  }

  render() {
    const { goBack } = this.props.navigation;
    const { loading } = this.state;

    return (
      <DetailPage pageTitle={I18n.t('configCurrencyPageTitle')} goBack={goBack}>
        {!loading ? this.renderContent() : this.renderLoading()}
      </DetailPage>
    );
  }
}

export default connect(null, { preferenceSetCountryCode })(StoreCurrency);
