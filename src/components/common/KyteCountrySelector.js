import React, { Component } from 'react';
import { Text, TouchableOpacity, FlatList, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import emojiFlags from 'emoji-flags';
import { CheckBox } from 'react-native-elements';

import { startLoading, stopLoading } from '../../stores/actions';
import { colors } from '../../styles';
import { kyteAccountGetCountries } from '../../services';

import I18n from '../../i18n/i18n';
import { SearchBar, KyteSafeAreaView, KyteText, ActionButton } from './';

const Strings = {
  SELECT_COUNTRY: I18n.t('expressions.selectCountry'),
  SELECT: I18n.t('words.s.select'),
};

class KyteCountrySelectorContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      countries: this.props.data || [],
      filteredCountries: this.props.data || [],
      isSearchBarVisible: false,
      selectedCountry: null,
    };
  }

  componentDidMount() {
    const { data } = this.props;
    if (!data || data.length <= 0) {
      this.props.startLoading();
      kyteAccountGetCountries(I18n.t('locale')).then(countries => {
        const orderedCountries = _.orderBy(countries.data, ['name'], ['asc']);
        this.setState({ countries: orderedCountries, filteredCountries: orderedCountries });
        this.props.stopLoading();
      });
    }
  }

  handleItemPress(country) {
    const { selectedCountry } = this.state;
    // trying to unselect it
    if (!!selectedCountry && country.code === selectedCountry.code) {
      return this.setState({ selectedCountry: null });
    }
    this.setState({ selectedCountry: country });
  }

  renderItem = ({ item, index }) => {
    const { selectedCountry } = this.state;
    const emojiFlag = emojiFlags.countryCode(item.code);

    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.handleItemPress(item)}
        style={styles.itemStyle}
        {...this.props.itemProps}
      >
        <View style={styles.textContainer}>
          <Text style={{ paddingTop: 3 }}>{emojiFlag.emoji}</Text>
          <KyteText weight="Regular" size={16} lineHeight={22.5} style={{ paddingLeft: 10 }}>
            {item.name}
          </KyteText>
        </View>

        <CheckBox
          key={index}
          containerStyle={styles.checkboxContainerStyle}
          fontFamily={'Graphik-Regular'}
          checkedIcon={'check-box'}
          uncheckedIcon={'check-box-outline-blank'}
          iconType={'material'}
          onPress={() => this.handleItemPress(item)}
          checked={!!selectedCountry && selectedCountry.code === item.code}
          checkedColor={colors.actionColor}
        />
      </TouchableOpacity>
    );
  };

  renderSearchBar() {
    const { countries, isSearchBarVisible } = this.state;

    const toggleSearch = () => this.setState({ isSearchBarVisible: !isSearchBarVisible });
    const searchCountries = (text) => {
      const filter = _.filter(countries, (country) =>
        country.name.toLowerCase().includes(text.toLowerCase()),
      );
      this.setState({ filteredCountries: filter });
    };
    const closeSearch = () =>
      this.setState({ isSearchBarVisible: false, filteredCountries: countries });

    return (
      <SearchBar
        isOpened={isSearchBarVisible}
        openedPlaceholder={I18n.t('productSearchPlaceholderActive')}
        closedPlaceholder={I18n.t('productSearchPlaceholder')}
        toggleSearch={toggleSearch.bind(this)}
        closeSearchAction={closeSearch.bind(this)}
        searchAction={searchCountries.bind(this)}
      />
    );
  }

  renderList() {
    const { filteredCountries } = this.state;
    return (
      <FlatList
        data={filteredCountries}
        renderItem={this.renderItem}
        keyExtractor={(item, i) => i.toString()}
      />
    );
  }

  render() {
    const { selectedCountry } = this.state;
    return (
      <KyteSafeAreaView style={{ flex: 1 }}>
        {this.renderSearchBar()}
        {this.renderList()}
        <View style={styles.bottomContainer}>
          <ActionButton
            onPress={() => this.props.onPress(selectedCountry)}
            disabled={!selectedCountry}
            noDisabledAlert
          >
            {!selectedCountry
              ? Strings.SELECT_COUNTRY
              : `${Strings.SELECT} ${selectedCountry.name}`}
          </ActionButton>
        </View>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  itemStyle: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    paddingHorizontal: 19,
    paddingVertical: 20,
    alignItems: 'center',
  },
  bottomContainer: {
    height: 70,
    justifyContent: 'center',
  },
  checkboxContainerStyle: {
    margin: 0,
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 5,
  },
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({
      startLoading,
      stopLoading,
    },
    dispatch,
  ),
});

const KyteCountrySelector = connect(null, mapDispatchToProps)(KyteCountrySelectorContainer);
export { KyteCountrySelector };
