import React from 'react';
import { connect } from 'react-redux';
import { useViewport } from '@kyteapp/kyte-ui-components';
import { setViewport } from '../../stores/actions/CommonActions';

const ViewportSync = ({ children, setViewport: updateViewport }) => {
  const viewport = useViewport();

  React.useEffect(() => {
    updateViewport(viewport);
  }, [viewport, updateViewport]);

  return <>{children}</>;
};

export default connect(null, { setViewport })(ViewportSync);
