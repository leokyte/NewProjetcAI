import React from 'react';
import PropTypes from 'prop-types';
import KyteBox from '../../../../node_modules/@kyteapp/kyte-ui-components/src/packages/utilities/kyte-box/KyteBox';
import KyteButtonV2 from '../../../../node_modules/@kyteapp/kyte-ui-components/src/packages/buttons/kyte-button-v2/KyteButtonV2';

const KyteBottomBar = ({
  size,
  bgColor,
  columnButton,

  title,
  icon,
  type,
  onPress,
  disabled,
  loading,

  secondButtonTitle,
  secondButtonIcon,
  secondButtonType,
  secondButtonOnPress,
  secondButtonDisabled,
  secondButtonLoading,
  testProps,
  secondButtonTestProps,
  children,
  ...props
}) => {
  const columnValid = () => {
    if (columnButton) {
      return '100%';
    }
    if (!!secondButtonTitle && !columnButton) {
      return '50%';
    }
    return '100%';
  };

  return (
    <>
      {children}
      <KyteBox
        bg={bgColor}
        d={columnButton && secondButtonTitle ? 'column' : 'row-reverse'}
        p={3}
        justify="center"
        align="center"
        {...props}>
        <KyteBox
          pl={columnButton || !secondButtonTitle ? undefined : 3}
          pb={columnButton && !!secondButtonTitle ? 2 : 0}
          w={columnValid()}>
          <KyteButtonV2
            startIcon={icon}
            type={type}
            onPress={onPress}
            disabled={disabled}
            loading={loading}
            size={size}
            title={title}
            full
            {...testProps}
          />
        </KyteBox>
        {secondButtonTitle && secondButtonOnPress && (
          <KyteBox
            pr={columnButton ? undefined : 3}
            w={columnButton ? '100%' : '50%'}>
            <KyteButtonV2
              startIcon={secondButtonIcon}
              type={secondButtonType}
              onPress={secondButtonOnPress}
              disabled={secondButtonDisabled}
              loading={secondButtonLoading}
              size={size}
              title={secondButtonTitle}
              full
              {...secondButtonTestProps}
            />
          </KyteBox>
        )}
      </KyteBox>
    </>
  );
};

KyteBottomBar.propTypes = {
  size: PropTypes.string,
  bgColor: PropTypes.string,
  columnButton: PropTypes.bool,
  title: PropTypes.string,
  icon: PropTypes.string,
  type: PropTypes.string,
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  secondButtonTitle: PropTypes.string,
  secondButtonIcon: PropTypes.string,
  secondButtonType: PropTypes.string,
  secondButtonOnPress: PropTypes.func,
  secondButtonDisabled: PropTypes.bool,
  secondButtonLoading: PropTypes.bool,
  children: PropTypes.node,
  testProps: PropTypes.shape(),
  secondButtonTestProps: PropTypes.shape(),
};

KyteBottomBar.defaultProps = {
  size: 'lg',
  bgColor: 'transparent',
  columnButton: false,
  title: null,
  icon: null,
  type: 'cancel',
  onPress: null,
  disabled: null,
  loading: null,
  secondButtonTitle: null,
  secondButtonIcon: null,
  secondButtonType: 'primary',
  secondButtonOnPress: null,
  secondButtonDisabled: null,
  secondButtonLoading: null,
  children: null,
  testProps: null,
  secondButtonTestProps: null,
};

export default KyteBottomBar;
