import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { KyteModal, ActionButton, KyteText, KyteIcon, CenterContent } from '../';
import I18n from '../../../i18n/i18n';
import { colors } from '../../../styles';
import { StockBoxesModal } from '../../../../assets/images';

const InsufficientStockModal = (props) => {
  // Extract props
  const { isModalVisible, hideModal, continueAnyway, goToCart } = props;

  // Styles
  const imageStyle = { height: 230, marginTop: -5 };
  const bottomButtonStyle = { marginVertical: 10 };
  const titleAndInfoContainerStyle = { alignItems: 'center', paddingHorizontal: 25, marginTop: 30 };
  const buttonsContainerStyle = { marginTop: 20 };

  // Aux Functions
  const modalTitle = (title) => <KyteText marginBottom={20} size={22} weight={'Medium'} pallete={'secondaryBg'}>{title}</KyteText>;
  const modalInfo = (text) => <KyteText marginBottom={10} size={16} lineHeight={20} textAlign={'center'} pallete={'secondaryBg'}>{text}</KyteText>;
  const modalCloseIcon = () => {
    const size = 25;
    const closeIconContainer = { position: 'absolute', right: 15, top: 10, zIndex: 100 };
    const closeIcon = { backgroundColor: colors.littleDarkGray, width: size, height: size, borderRadius: 15 };
    return (
      <TouchableOpacity style={closeIconContainer} onPress={hideModal}>
        <CenterContent style={closeIcon}>
          <KyteIcon name={'close-navigation'} size={size * 0.4} color={colors.secondaryBg} />
        </CenterContent>
      </TouchableOpacity >
    );
  };

  // Action function
  const execAction = (action) => {
    hideModal();
    action();
  };

  // Modal itself
  return (
    <KyteModal
      isModalVisible={isModalVisible}
      hideModal={hideModal}
      noPadding
      noEdges
      height={'auto'}
    >
      <View>
        {modalCloseIcon()}
        <Image style={imageStyle} resizeMode={'cover'} source={{ uri: StockBoxesModal }} />

        <View style={titleAndInfoContainerStyle}>
          {modalTitle(I18n.t('stockInsufficient'))}
          {modalInfo(I18n.t('ConfirmOrderInsufficientStockInfo'))}
        </View>

        <View style={buttonsContainerStyle}>
          <ActionButton cancel onPress={() => execAction(continueAnyway)}>
            {I18n.t('ContinueAnyway')}
          </ActionButton>
          <ActionButton onPress={() => execAction(goToCart)} style={bottomButtonStyle}>
            {I18n.t('GoToCart')}
          </ActionButton>
        </View>
      </View>
    </KyteModal>
  );
};

export default React.memo(InsufficientStockModal);
