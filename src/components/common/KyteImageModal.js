import React from 'react';
import { View } from 'react-native';
import Modal from 'react-native-modal';
import Gallery from 'react-native-image-gallery';
import { headerStyles } from '../../styles';
import { getImageUrl, getImagePath, isIphoneX, generateTestID } from '../../util';
import HeaderButton from './HeaderButton';
import { KyteSafeAreaView } from './KyteSafeAreaView';

const KyteImageModal = (props) => {
  const { document, useLocal } = props;
  const isExternalImage = document.image.startsWith('http');
  const imageUrl = isExternalImage ? document.image : getImageUrl(document);

  return (
    <Modal
      isVisible={props.isModalVisible}
      backdropColor={'#000'}
      backdropOpacity={1}
      hideOnBack={props.hideOnBack}
      onBackButtonPress={props.onBackButtonPress}
      style={{ margin: 0 }}
    >
      <KyteSafeAreaView style={{ flex: 1 }}>
        <View
          style={[
            headerStyles.headerBase(0, 'absolute', null, isIphoneX() ? 20 : null),
            headerStyles.headerTransparent,
          ]}
          {...generateTestID('modal-visible')}
        >
          <HeaderButton
            icon='close'
            color={'#FFF'}
            onPress={props.hideModal}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          />
        </View>
        <Gallery
          style={{ backgroundColor: '#000' }}
          images={[
            {
              source: { uri: document.uid && !useLocal ? imageUrl : getImagePath(document.image) },
            },
          ]}
        />
      </KyteSafeAreaView>
    </Modal>

  );
};

export { KyteImageModal };
