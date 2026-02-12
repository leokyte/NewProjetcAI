import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { KyteModal, KyteText, ActionButton, KyteIcon, CenterContent } from './';
import { colors } from '../../styles';
import I18n from '../../i18n/i18n';
import { generateTestID } from '../../util';

const KyteAlert = (props) => {
  const { hideModal, title, contentText, renderContent, action, dontCloseOnBackdropClick } = props;

  const renderTitle = () => (
    <View style={{ marginTop: 30 }}>
      <KyteText weight={'Medium'} size={17} testProps={generateTestID('title-kalert')}>{title}</KyteText>
    </View>
  );

  const renderContentText = () => (
    <KyteText size={15} style={{ textAlign: 'center', lineHeight: 20 }}>
      {contentText}
    </KyteText>
  );

  const renderTopCloseButton = () => {
    const closeIconContainer = { position: 'absolute', right: 1, top: 1, zIndex: 100 };
    const closeIcon = {
      backgroundColor: colors.littleDarkGray,
      width: 20,
      height: 20,
      borderRadius: 15,
    };
    return (
      <TouchableOpacity
        style={closeIconContainer}
        onPress={hideModal}
        {...generateTestID('close-kalert')}
      >
        <CenterContent style={closeIcon}>
          <KyteIcon name={'close-navigation'} size={9} />
        </CenterContent>
      </TouchableOpacity>
    );
  };

  return (
    <KyteModal
      isModalVisible
      hideModal={() => hideModal()}
      height='auto'
      dontCloseOnBackdropClick={dontCloseOnBackdropClick}
    >
      <View style={{ alignItems: 'center' }}>
        {props.showTopCloseButton ? renderTopCloseButton() : null}
        {title ? renderTitle() : null}

        <View style={{ marginVertical: 20, paddingHorizontal: '5%' }}>
          {renderContent ? renderContent() : renderContentText()}
        </View>

        <View
          style={{ width: '100%', alignItems: 'center', marginTop: 10 }}
          {...generateTestID('button-kalert')}
        >
          <ActionButton onPress={() => (action ? action() : hideModal())} style={{ width: '100%' }}>
            {props.actionButtonText || I18n.t('alertOk')}
          </ActionButton>
        </View>
      </View>
    </KyteModal>
  );
};

export { KyteAlert };
