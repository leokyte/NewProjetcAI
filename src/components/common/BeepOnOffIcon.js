import React from 'react';
import { connect } from 'react-redux';

import HeaderButton from './HeaderButton';
import { commonSetValues } from '../../stores/actions';
import { colors } from '../../styles';
import { bindActionCreators } from 'redux';

const BOOI = props => {
  const { barcodeBeep } = props;
  return (
    <HeaderButton
      buttonKyteIcon
      size={21}
      icon={barcodeBeep ? 'sound' : 'sound-off'}
      color={colors.primaryColor}
      onPress={() => props.commonSetValues({ barcodeBeep: !barcodeBeep })}
    />
  );
};

const mapDispatchToProps = (dispatch) => ({ commonSetValues: bindActionCreators(commonSetValues, dispatch) });

const BeepOnOffIcon = connect(
  ({ common }) => ({ barcodeBeep: common.barcodeBeep }),
  mapDispatchToProps
)(BOOI);

export { BeepOnOffIcon };
