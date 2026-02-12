import React from 'react';
import { View, Text } from 'react-native';
import { KyteToolbar, KyteBarCode, BeepOnOffIcon, KyteSafeAreaView } from '../../common';
import { colors, Type } from '../../../styles';
import I18n from '../../../i18n/i18n';

const BarcodeReader = (props) => {
  const { navigate, goBack } = props.navigation;
  const { params = {} } = props.route;
  const onBarcodeRead = params.onBarcodeRead;

  const handleBarcodeRead = (barcode) => {
    onBarcodeRead && onBarcodeRead(barcode);
    goBack();
  };

  const renderRightComponent = () => <BeepOnOffIcon />;

  return (
    <KyteSafeAreaView style={styles.outerContainer}>
      <KyteToolbar
        innerPage
        borderBottom={1.5}
        headerTitle={I18n.t('assingBarcode')}
        goBack={() => goBack()}
        navigate={navigate}
        navigation={props.navigation}
        rightComponent={renderRightComponent()}
      />
      <View style={{ flex: 1 }}>
        <KyteBarCode height={200} onBarcodeRead={handleBarcodeRead.bind(this)} isVisible />
        <View style={styles.tipView}>
          <Text style={[Type.Regular, styles.tipText]}>
            {I18n.t('barcodeProductSaveTip')}
          </Text>
        </View>
      </View>
    </KyteSafeAreaView>
  );
};

export default BarcodeReader;


const styles = {
  outerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: colors.lightBg
  },
  tipView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryBg,
    paddingHorizontal: 35
  },
  tipText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 35,
    textAlign: 'center'
  }
};
