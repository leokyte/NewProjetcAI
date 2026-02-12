import React from 'react';
import { View, Image } from 'react-native';
import { KyteText, KyteAlert } from '../';
import { PinProductTipImage } from '../../../../assets/images';
import I18n from '../../../i18n/i18n';

const PinProductTipModal = (props) => {
  // Extract props
  const { hideModal } = props;

  // Style
  const imageContainer = { marginVertical: 10  };
  const imageStyle = { height: 135 };
  const titleContainer = { alignItems: 'center', marginTop: 30 };
  const titleStyle = { fontSize: 18 };
  const infoContainer = { marginTop: 15 };
  const infoStyle = { fontSize: 14, textAlign: 'center', lineHeight: 19 };

  // render
  const renderContent = () => (
    <View>
      <View style={imageContainer}>
        <Image style={imageStyle} resizeMode={'contain'} source={{ uri: PinProductTipImage }}/>
      </View>
      <View style={titleContainer}>
        <KyteText style={titleStyle} weight={'Medium'}>
          {I18n.t('pinProductTipTitle')}
        </KyteText>
      </View>
      <View style={infoContainer}>
        <KyteText style={infoStyle}>{I18n.t('pinProductTipInfo')}</KyteText>
      </View>
    </View>
  );

  return (
    <KyteAlert
      hideModal={hideModal}
      showTopCloseButton
      renderContent={renderContent}
      testProps={props.testProps}
    />
  );
};

export default React.memo(PinProductTipModal);
