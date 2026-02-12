import React from 'react';
import { KyteModal } from '../';

const GenericModalPage = (props) => (
  <KyteModal
    height={'100%'}
    isModalVisible={props.isVisible}
    noPadding
    noEdges
    fullPage
    hideModal={() => null}
  >
    {props.children}
  </KyteModal>
);

export { GenericModalPage };
