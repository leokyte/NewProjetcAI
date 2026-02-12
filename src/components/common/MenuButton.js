import React from 'react';
import { connect } from 'react-redux';
import { generateTestID } from '../../util';
import HeaderButton from './HeaderButton';
import { colors } from '../../styles';

const MenuButtonComponent = ({ intercomUnreadConversation, color, navigate, notificate }) => {
  const hasUnreadConversation = intercomUnreadConversation > 0;
  return (
    <HeaderButton
      icon='menu'
      color={color || colors.terciaryColor}
      onPress={navigate}
      buttonNotification={notificate || hasUnreadConversation}
      testProps={generateTestID('btn-menu')}
    />
  );
};

const mapStateToProps = (state) => ({
  intercomUnreadConversation: state.common.intercomUnreadConversation,
});

const MenuButton = connect(mapStateToProps, null)(MenuButtonComponent);

export { MenuButton };
