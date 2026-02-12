import React from 'react';
import { Dimensions, Platform, Image, View, Text } from 'react-native';
import { colors, scaffolding } from '../../styles';
import { ActionButton } from '../common';
import {
  Admin,
  PersonalAccess,
  InativateUser,
  DeleteUser,
  CatalogMobileDesktop,
  StockBoxes,
  AllowCustomerInDebt,
} from '../../../assets/images';

const Tip = (props) => {
  const {
    topContainer,
    infoContainer,
    infoStyle,
    svgImage,
    svgImageVertical,
    observationContainer,
    observationText,
  } = styles;
  const { bottomContainer } = scaffolding;

  const generateTipImageStyle = (image) => {
    if (image === 'Admin') return svgImageVertical;
    if (
      image === 'PersonalAccess' ||
      image === 'InativateUser' ||
      image === 'DeleteUser' ||
      image === 'CatalogMobileDesktop' ||
      image === 'StockBoxes'
    )
      return svgImage;

    if ('AllowCustomerInDebt')
      return {
        width: '100%',
        resizeMode: 'contain',
        height: Dimensions.get('window').height * 0.2,
      };
  };
  const generateTipImage = (image) => {
    if (image === 'Admin') return Admin;
    if (image === 'PersonalAccess') return PersonalAccess;
    if (image === 'InativateUser') return InativateUser;
    if (image === 'DeleteUser') return DeleteUser;
    if (image === 'CatalogMobileDesktop') return CatalogMobileDesktop;
    if (image === 'StockBoxes') return StockBoxes;
    if (image === 'AllowCustomerInDebt') return AllowCustomerInDebt;
  };

  const renderImage = (image) => (
    <Image style={[generateTipImageStyle(image)]} source={{ uri: generateTipImage(image) }} />
  );

  const renderContentSimple = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={topContainer}>{renderImage(props.image)}</View>
        {props.text ? (
          <View style={infoContainer}>
            <Text style={infoStyle}>{props.text}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderContentComple = () => {
    return (
      <View style={{ flex: 1 }}>
        {props.textHeaderImage}
        <View style={topContainer}>{renderImage(props.type, props.image)}</View>
        {props.textFooterImage}
      </View>
    );
  };

  const renderButton = () => {
    return (
      <ActionButton disabled={false} onPress={props.onPress} nextArrow={props.btnNextArrow}>
        {props.btnText}
      </ActionButton>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {props.image === 'DeleteUser' ? renderContentComple() : renderContentSimple()}
      {props.observation ? (
        <View style={observationContainer}>
          <Text style={observationText}>{props.observation}</Text>
        </View>
      ) : null}
      {props.showButton ? (
        <View style={bottomContainer}>{props.buttonDisabled ? null : renderButton()}</View>
      ) : null}
    </View>
  );
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const styles = {
  topContainer: {
    backgroundColor: colors.drawerIcon,
    alignItems: 'center',
  },
  infoContainer: {
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  infoStyle: {
    fontFamily: 'Graphik-Regular',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
    color: colors.primaryColor,
    ...Platform.select({
      ios: { lineHeight: (SMALL_SCREENS) ? 18 : 22 },
      android: { lineHeight: (SMALL_SCREENS) ? 18 : 25 },
    }),
  },
  svgImage: {
    resizeMode: 'contain',
    width: Dimensions.get('window').width * 0.6,
    height: Dimensions.get('window').height * 0.3,
  },
  svgImageVertical: {
    resizeMode: 'contain',
    width: Dimensions.get('window').width * 0.4,
    height: Dimensions.get('window').height * 0.3,
  },
  observationContainer: {
    paddingHorizontal: 40,
    paddingBottom: 10,
  },
  observationText: {
    fontFamily: 'Graphik-Regular',
    color: colors.grayBlue,
    textAlign: 'center',
    lineHeight: 18,
  },
};

export { Tip };
