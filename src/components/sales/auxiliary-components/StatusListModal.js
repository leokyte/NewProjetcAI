import React, { useState, useMemo } from 'react';
import I18n from 'react-native-i18n';
import _ from 'lodash';
import { Margin } from '@kyteapp/kyte-ui-components';
import { KyteModal } from '../../common/KyteModal';
import { ActionButton } from '../../common/ActionButton';
import { capitalizeFirstLetterOfString } from '../../../util/util-common';
import StatusFilter from '../StatusFilter';
import { OrderStatus } from '../../../enums/OrderStatus';

const ORDER_STATUS_ALL = OrderStatus.items[OrderStatus.ALL].status;

const StatusListModal = ({ hideModal, statusList, handleSubmit, defaultSelectedStatuses = [] }) => {
  const [selectedStatuses, setSelectedStatuses] = useState(defaultSelectedStatuses);
  const activeStatusesList = useMemo(() => _.filter(statusList, 'active'), [statusList]);

  const selectStatus = (status) => {
    const isSelected = selectedStatuses.includes(status);
    const isStatusAll = status === ORDER_STATUS_ALL;
    const statusesWithinSelected = isStatusAll ? [] : selectedStatuses.concat(status);
    const statusesWithoutSelected = isStatusAll ? [] : _.filter(selectedStatuses, !status);
    const updatedSelectedStatuses = isSelected ? statusesWithoutSelected : statusesWithinSelected;

    setSelectedStatuses(updatedSelectedStatuses);
  };

  return (
    <KyteModal
      bottomPage
      height="auto"
      title={capitalizeFirstLetterOfString(`${I18n.t('expressions.selectMoreThanOne')}...`)}
      isModalVisible
      hideModal={hideModal}
    >
      <StatusFilter
        onPress={selectStatus}
        selectedStatus={selectedStatuses}
        statusList={activeStatusesList}
      />
      <Margin bottom={5}>
        <ActionButton onPress={() => handleSubmit(selectedStatuses)}>
          {I18n.t('stockHistoricalFilterButton')}
        </ActionButton>
      </Margin>
    </KyteModal>
  );
};

export default StatusListModal;
