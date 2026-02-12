import React from 'react';
import { Image } from 'react-native';
import { PaymentGatewayType, toList } from '../../enums';

const Gateway = (item) => toList(PaymentGatewayType).find((g) => g.type === item);

const GatewayLogo = (props) => (
  <Image
    style={styles.image(props.width, props.height)}
    source={{ uri: Gateway(props.gateway)?.logo }}
    resizeMode={props.resizeMode}
  />
);

const styles = {
  image: (width = 30, height = 20) => ({
    width,
    height,
  }),
};

export { GatewayLogo };
