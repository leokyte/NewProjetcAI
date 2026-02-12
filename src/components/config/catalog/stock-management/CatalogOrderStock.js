import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { storeAccountSave } from '../../../../stores/actions';
import { DetailPage, ActionButton, RadioOption, LoadingCleanScreen } from '../../../common';
import I18n from '../../../../i18n/i18n';

class CatalogOrderStock extends Component {
  constructor(props) {
    super(props);

    const stockOptions = [
      { label: I18n.t('catalogHideNoStockItems'), type: 'hide-out-of-stock' },
      { label: I18n.t('catalogDisplayStockAsUnavailable'), type: 'show-as-unavailable' },
      { label: I18n.t('catalogDisplayNoStockItems'), type: 'show-out-of-stock' },
    ];

    this.state = {
      stockOptions,
      selected: this.initialSelection(),
    };
  }

  initialSelection() {
    const { store } = this.props;
    const { displayNoStockItems, displayNoStockAsUnavailable } = store.catalog;

    if (displayNoStockAsUnavailable) return 'show-as-unavailable';
    if (displayNoStockItems) return 'show-out-of-stock';
    if (!displayNoStockItems) return 'hide-out-of-stock';
  }

  setOptionSelected(item) {
    this.setState({ selected: item.type });
  }

  saveStore() {
    const { selected } = this.state;
    const { store } = this.props;
    const { goBack } = this.props.navigation;

    const saveProps = () => ({
      displayNoStockItems: (selected === 'show-out-of-stock' || selected === 'show-as-unavailable'),
      displayNoStockAsUnavailable: selected === 'show-as-unavailable',
    });

    this.props.storeAccountSave({ ...store, catalog: { ...store.catalog, ...saveProps() } }, () =>
      goBack(),
    );
  }

  render() {
    const { loader } = this.props;
    const { stockOptions, selected } = this.state;
    const containerStyle = { flex: 1 };
    const btnStyle = { marginBottom: 10 };

    return (
      <DetailPage
        pageTitle={I18n.t('catalogStockConfigTitle')}
        goBack={() => this.props.navigation.goBack()}
      >
        <View style={containerStyle}>
          {stockOptions.map((item, index) => (
            <RadioOption
              onPress={this.setOptionSelected.bind(this)}
              selected={selected === item.type}
              key={index}
              item={item}
            />
          ))}
        </View>
        <ActionButton
          style={btnStyle}
          onPress={() => this.saveStore()}
          alertTitle={I18n.t('words.s.attention')}
          alertDescription={I18n.t('enterAllfields')}
        >
          {I18n.t('alertSave')}
        </ActionButton>
        {loader ? <LoadingCleanScreen /> : null}
      </DetailPage>
    );
  }
}

const mapStateToProps = ({ auth, common }) => ({
  store: auth.store,
  loader: common.loader.visible,
});

export default connect(mapStateToProps, { storeAccountSave })(CatalogOrderStock);
