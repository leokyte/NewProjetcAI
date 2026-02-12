import React from 'react';
import { KyteIcon } from './';
import { colors } from '../../styles';

const ProductPinStar = (props) => {
  const size = props.size || 11;
  const hasShadow = props.shadow;
  const style = {
    shadowColor: colors.primaryDarker,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.42,
    // shadowRadius: 2.22,
  };

  return (
    <KyteIcon
      name={'highlight-star'}
      color={colors.highlight}
      size={size}
      style={hasShadow ? style : {}}
    />
  );
};

export default React.memo(ProductPinStar);
