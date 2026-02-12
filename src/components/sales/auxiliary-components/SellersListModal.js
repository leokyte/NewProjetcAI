import React, { useState, useMemo } from 'react';
import I18n from 'react-native-i18n';
import { ActionButton } from '../../common/ActionButton';
import { capitalizeFirstLetterOfString } from '../../../util/util-common';
import { KyteModal } from '../../common/KyteModal';
import SellersFilter from '../SellersFilter';
import { CATALOG_USER_UID } from '../../../kyte-constants';
import { Padding } from '@kyteapp/kyte-ui-components';

const SellersListModal = ({ hideModal, handleSubmit, defaultSelectedSellers = [], ...props }) => {
  const [selectedSellers, setSellectedSellers] = useState(defaultSelectedSellers);
  const [isCatalogFilterActive, setIsCatalogFilterActive] = useState(
    props.isCatalogFilterActive ?? false,
  );
  const catalogUser = useMemo(
    () => ({
      uid: CATALOG_USER_UID,
      displayName: I18n.t('billingFeatures.catalog'),
      onPress: () => {
        setSellectedSellers([]);
        setIsCatalogFilterActive((isActive) => !isActive);
      },
    }),
    [setSellectedSellers],
  );
  const sellers = useMemo(() => [catalogUser, ...props.sellers], [catalogUser, props.sellers]);

  const selectSeller = (selectedSeller) => {
    const sellersWithinSelectedSeller = [...selectedSellers, selectedSeller];
    const sellersWithoutSellected = selectedSellers.filter(({ uid }) => uid !== selectedSeller.uid);
    const isSelected = selectedSellers.some(({ uid }) => uid === selectedSeller.uid);
    const list = isSelected ? sellersWithoutSellected : sellersWithinSelectedSeller;

    setSellectedSellers(list);
    setIsCatalogFilterActive(false);
  };

  return (
    <KyteModal
      bottomPage
      height="auto"
      title={capitalizeFirstLetterOfString(`${I18n.t('expressions.selectMoreThanOne')}...`)}
      isModalVisible
      hideModal={hideModal}
    >
      <SellersFilter
        onPress={selectSeller}
        catalog={isCatalogFilterActive}
        selectedUsers={selectedSellers}
        sellers={sellers}
      />
      <Padding vertical={10}>
        <ActionButton onPress={() => handleSubmit({ selectedSellers, isCatalogFilterActive })}>
          {I18n.t('stockHistoricalFilterButton')}
        </ActionButton>
      </Padding>
    </KyteModal>
  );
};

export default SellersListModal;
