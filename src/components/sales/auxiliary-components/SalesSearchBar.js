import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import I18n from '../../../i18n/i18n';
import { SearchBar } from '../../common';
import { salesSetFilter, ordersSetFilter, salesResetListSize } from '../../../stores/actions';

const SalesSearchBar = (props) => {
  const { salesType } = props;
  const [ visibility, setVisibility ] = useState(false);
  const search = salesType === 'order' ? props.searchOrders : props.searchSales;

  useEffect(() => {
    return () => {
      if (salesType === 'order') return props.ordersSetFilter('', 'search');
      props.salesSetFilter('', 'search');
    };
  }, []);

  const toggleSearch = () => setVisibility(!visibility);

  const fetchSalesByTerm = (term) => {
    props.salesResetListSize();
    if (salesType === 'order') return props.ordersSetFilter(term, 'search');
    props.salesSetFilter(term, 'search');
  };

  const onCloseSearch = () => {
    setVisibility(false);
    if (!search) return;
    if (salesType === 'order') return props.ordersSetFilter('', 'search');
    props.salesSetFilter('', 'search');
  };

  return (
    <SearchBar
      isOpened={visibility}
      openedPlaceholder={I18n.t('salesSearchPlaceholderActive')}
      closedPlaceholder={I18n.t('ordersSearchPlaceholder')}
      toggleSearch={() => toggleSearch()}
      closeSearchAction={() => onCloseSearch()}
      searchAction={(term) => fetchSalesByTerm(term)}
      value={search}
      disabled={props.disabled}
    />
  );
};

const mapStateToProps = ({ sales }) => ({
  searchSales: sales.filterSales.search,
  searchOrders: sales.filterOrders.search,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({
    salesSetFilter,
    ordersSetFilter,
    salesResetListSize,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SalesSearchBar);
